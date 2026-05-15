// frontend/src/hooks/useSocket.js
// Drop this hook into any component that needs real-time data.
//
// Usage:
//   const { isConnected, sensorData, newAlerts, latestAiLog } = useSocket();
//   const { isConnected } = useSocket({ roomName: 'Lab 1' }); // room-specific

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  connectSocket,
  disconnectSocket,
  subscribeToRoom,
  unsubscribeFromRoom,
  onSensorUpdate,
  onRoomSensorUpdate,
  onNewAlert,
  onAlertResolved,
  onAiReasoning,
  onAnalyticsUpdate,
  onRoomUpdate,
  onConnect,
  onDisconnect,
  onConnectError,
  isConnected as checkConnected,
} from '../services/socket';

/**
 * @param {Object} options
 * @param {string} [options.roomName]     - If provided, also subscribes to this room's channel
 * @param {number} [options.maxAlerts=20] - Max alerts to keep in state
 */
const useSocket = ({ roomName = null, maxAlerts = 20 } = {}) => {
  const [connected, setConnected] = useState(checkConnected());
  const [connectionError, setConnectionError] = useState(null);

  // Latest sensor reading per room: { "Lab 1": { temperature, airQuality, ... }, ... }
  const [sensorData, setSensorData] = useState({});

  // Latest sensor reading for the subscribed room (if roomName provided)
  const [roomSensorData, setRoomSensorData] = useState(null);

  // New alerts received this session (most recent first)
  const [newAlerts, setNewAlerts] = useState([]);

  // IDs of alerts resolved this session
  const [resolvedAlertIds, setResolvedAlertIds] = useState(new Set());

  // Latest AI analysis
  const [latestAiLog, setLatestAiLog] = useState(null);

  // Analytics data per room
  const [analyticsData, setAnalyticsData] = useState({});

  // Room status updates
  const [roomStatuses, setRoomStatuses] = useState({});

  // Track unread alert count for notification badge
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const acknowledgedRef = useRef(false);

  const clearUnreadCount = useCallback(() => {
    setUnreadAlertCount(0);
    acknowledgedRef.current = true;
  }, []);

  // ─── Connect on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    connectSocket();

    const cleanupConnect = onConnect(() => {
      setConnected(true);
      setConnectionError(null);
      console.log('[useSocket] Connected');
    });

    const cleanupDisconnect = onDisconnect((reason) => {
      setConnected(false);
      console.log('[useSocket] Disconnected:', reason);
    });

    const cleanupError = onConnectError((err) => {
      setConnectionError(err.message);
      console.error('[useSocket] Connection error:', err.message);
    });

    return () => {
      cleanupConnect();
      cleanupDisconnect();
      cleanupError();
    };
  }, []);

  // ─── Room subscription ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomName) return;

    subscribeToRoom(roomName);

    const cleanup = onRoomSensorUpdate((data) => {
      if (data.room === roomName) {
        setRoomSensorData(data);
      }
    });

    return () => {
      unsubscribeFromRoom(roomName);
      cleanup();
    };
  }, [roomName]);

  // ─── Global sensor updates ────────────────────────────────────────────────────
  useEffect(() => {
    const cleanup = onSensorUpdate((data) => {
      setSensorData((prev) => ({
        ...prev,
        [data.room]: data,
      }));
    });
    return cleanup;
  }, []);

  // ─── Alert events ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cleanupNew = onNewAlert((alert) => {
      setNewAlerts((prev) => [alert, ...prev].slice(0, maxAlerts));
      setUnreadAlertCount((c) => c + 1);
    });

    const cleanupResolved = onAlertResolved((data) => {
      setResolvedAlertIds((prev) => new Set([...prev, data._id]));
      // Remove from newAlerts if it's there
      setNewAlerts((prev) => prev.filter((a) => a._id !== data._id));
    });

    return () => {
      cleanupNew();
      cleanupResolved();
    };
  }, [maxAlerts]);

  // ─── AI reasoning ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cleanup = onAiReasoning((analysis) => {
      setLatestAiLog(analysis);
    });
    return cleanup;
  }, []);

  // ─── Analytics updates ────────────────────────────────────────────────────────
  useEffect(() => {
    const cleanup = onAnalyticsUpdate((stats) => {
      if (stats.room) {
        setAnalyticsData((prev) => ({
          ...prev,
          [stats.room]: stats,
        }));
      }
    });
    return cleanup;
  }, []);

  // ─── Room status changes ──────────────────────────────────────────────────────
  useEffect(() => {
    const cleanup = onRoomUpdate((room) => {
      setRoomStatuses((prev) => ({
        ...prev,
        [room.name]: room.status,
      }));
    });
    return cleanup;
  }, []);

  return {
    // Connection state
    isConnected: connected,
    connectionError,

    // Data
    sensorData,           // All rooms: { "Lab 1": {...}, "Lab 2": {...} }
    roomSensorData,       // Current room only (if roomName was passed)
    newAlerts,            // New alerts received this session
    resolvedAlertIds,     // Set of resolved alert IDs
    latestAiLog,          // Most recent AI analysis
    analyticsData,        // Analytics per room
    roomStatuses,         // Room status overrides

    // Alert badge
    unreadAlertCount,
    clearUnreadCount,
  };
};

export default useSocket;
