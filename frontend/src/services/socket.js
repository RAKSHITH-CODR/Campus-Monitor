import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let listenerCallbacks = {};

export const initSocket = () => {
  if (socket && socket.connected) return socket;
  
  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listenerCallbacks = {};
  }
};

// Event listeners - prevent duplicate listeners
export const onSensorUpdate = (callback) => {
  if (listenerCallbacks.sensorUpdate) {
    getSocket().off('sensorUpdate', listenerCallbacks.sensorUpdate);
  }
  listenerCallbacks.sensorUpdate = callback;
  getSocket().on('sensorUpdate', callback);
};

export const onNewAlert = (callback) => {
  if (listenerCallbacks.newAlert) {
    getSocket().off('newAlert', listenerCallbacks.newAlert);
  }
  listenerCallbacks.newAlert = callback;
  getSocket().on('newAlert', callback);
};

export const onAIReasoning = (callback) => {
  if (listenerCallbacks.aiReasoning) {
    getSocket().off('aiReasoning', listenerCallbacks.aiReasoning);
  }
  listenerCallbacks.aiReasoning = callback;
  getSocket().on('aiReasoning', callback);
};

export const onAnalyticsUpdate = (callback) => {
  if (listenerCallbacks.analyticsUpdate) {
    getSocket().off('analyticsUpdate', listenerCallbacks.analyticsUpdate);
  }
  listenerCallbacks.analyticsUpdate = callback;
  getSocket().on('analyticsUpdate', callback);
};

export const onRoomUpdate = (callback) => {
  if (listenerCallbacks.roomUpdate) {
    getSocket().off('roomUpdate', listenerCallbacks.roomUpdate);
  }
  listenerCallbacks.roomUpdate = callback;
  getSocket().on('roomUpdate', callback);
};

// Room subscription
export const joinRoom = (roomId) => {
  getSocket().emit('join', { room: roomId });
};

export const leaveRoom = (roomId) => {
  getSocket().emit('leave', { room: roomId });
};

// Cleanup listeners
export const removeListener = (event) => {
  if (socket && listenerCallbacks[event]) {
    socket.off(event, listenerCallbacks[event]);
    delete listenerCallbacks[event];
  }
};

export const removeAllListeners = () => {
  if (socket) {
    Object.keys(listenerCallbacks).forEach((event) => {
      socket.off(event, listenerCallbacks[event]);
    });
    listenerCallbacks = {};
  }
};
