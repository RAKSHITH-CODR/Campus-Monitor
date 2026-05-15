// frontend/src/services/socket.js
// Singleton Socket.IO client — one connection shared across the whole app.
// Import and use the exported helpers; don't create new io() instances elsewhere.

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create a single persistent connection
const socket = io(SOCKET_URL, {
  autoConnect: false,       // We'll connect manually after login
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  transports: ['websocket', 'polling'],
});

// ─── Connection Lifecycle ──────────────────────────────────────────────────────

/**
 * Connect to the server. Call this after the user logs in.
 */
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Disconnect from the server. Call this on logout.
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// ─── Room Subscriptions ────────────────────────────────────────────────────────

/**
 * Subscribe to a specific room's data stream.
 * The server will push sensor updates directly to this client.
 * @param {string} roomName - e.g. "Lab 1"
 */
export const subscribeToRoom = (roomName) => {
  socket.emit('joinRoom', roomName);
};

/**
 * Unsubscribe from a specific room's data stream.
 * @param {string} roomName
 */
export const unsubscribeFromRoom = (roomName) => {
  socket.emit('leaveRoom', roomName);
};

// ─── Event Listener Helpers ────────────────────────────────────────────────────
// These return cleanup functions — use them in useEffect return values.

/**
 * Listen for global sensor updates (all rooms).
 * @param {Function} callback - receives sensor data object
 * @returns {Function} cleanup function
 */
export const onSensorUpdate = (callback) => {
  socket.on('sensorUpdate', callback);
  return () => socket.off('sensorUpdate', callback);
};

/**
 * Listen for sensor updates from a specific room (requires subscribeToRoom first).
 * @param {Function} callback
 * @returns {Function} cleanup
 */
export const onRoomSensorUpdate = (callback) => {
  socket.on('roomSensorUpdate', callback);
  return () => socket.off('roomSensorUpdate', callback);
};

/**
 * Listen for new alerts.
 * @param {Function} callback
 * @returns {Function} cleanup
 */
export const onNewAlert = (callback) => {
  socket.on('newAlert', callback);
  return () => socket.off('newAlert', callback);
};

/**
 * Listen for alert resolutions.
 * @param {Function} callback
 * @returns {Function} cleanup
 */
export const onAlertResolved = (callback) => {
  socket.on('alertResolved', callback);
  return () => socket.off('alertResolved', callback);
};

/**
 * Listen for AI reasoning/anomaly analysis results.
 * @param {Function} callback
 * @returns {Function} cleanup
 */
export const onAiReasoning = (callback) => {
  socket.on('aiReasoning', callback);
  return () => socket.off('aiReasoning', callback);
};

/**
 * Listen for analytics updates (hourly aggregates).
 * @param {Function} callback
 * @returns {Function} cleanup
 */
export const onAnalyticsUpdate = (callback) => {
  socket.on('analyticsUpdate', callback);
  return () => socket.off('analyticsUpdate', callback);
};

/**
 * Listen for room status changes.
 * @param {Function} callback
 * @returns {Function} cleanup
 */
export const onRoomUpdate = (callback) => {
  socket.on('roomUpdate', callback);
  return () => socket.off('roomUpdate', callback);
};

// ─── Connection Status Listeners ───────────────────────────────────────────────

export const onConnect = (callback) => {
  socket.on('connect', callback);
  return () => socket.off('connect', callback);
};

export const onDisconnect = (callback) => {
  socket.on('disconnect', callback);
  return () => socket.off('disconnect', callback);
};

export const onConnectError = (callback) => {
  socket.on('connect_error', callback);
  return () => socket.off('connect_error', callback);
};

export const isConnected = () => socket.connected;

export default socket;
