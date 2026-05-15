// backend/src/services/socketManager.js
// Centralized Socket.IO manager — import this wherever you need to emit events.
// Usage: const { getIO, emitSensorUpdate, emitNewAlert } = require('./socketManager');

let io = null;

/**
 * Initialize with the Socket.IO server instance.
 * Call this once in app.js after creating the IO server.
 */
const initSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Allow clients to subscribe to a specific room's data stream
    socket.on('joinRoom', (roomName) => {
      socket.join(`room:${roomName}`);
      console.log(`[SOCKET] ${socket.id} joined room:${roomName}`);
    });

    socket.on('leaveRoom', (roomName) => {
      socket.leave(`room:${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Get the IO instance (throws if not initialized).
 */
const getIO = () => {
  if (!io) throw new Error('[SOCKET] Socket.IO not initialized. Call initSocket() first.');
  return io;
};

// ─── Emit Helpers ─────────────────────────────────────────────────────────────

/**
 * Broadcast live sensor data to all clients AND to the specific room channel.
 * @param {Object} data - { room, temperature, airQuality, energyUsage, motion, timestamp }
 */
const emitSensorUpdate = (data) => {
  if (!io) return;
  // Broadcast to everyone
  io.emit('sensorUpdate', data);
  // Also emit to clients subscribed to this specific room
  io.to(`room:${data.room}`).emit('roomSensorUpdate', data);
};

/**
 * Broadcast a new alert to all clients.
 * @param {Object} alert - Mongoose alert document
 */
const emitNewAlert = (alert) => {
  if (!io) return;
  io.emit('newAlert', {
    _id: alert._id,
    room: alert.room,
    severity: alert.severity,
    message: alert.message,
    status: alert.status,
    createdAt: alert.createdAt,
  });
  // Also emit to the specific room channel
  io.to(`room:${alert.room}`).emit('roomAlert', alert);
};

/**
 * Broadcast AI reasoning/analysis result to all clients.
 * @param {Object} analysis - { room, reasoning, actionTaken, severity, timestamp }
 */
const emitAiReasoning = (analysis) => {
  if (!io) return;
  io.emit('aiReasoning', analysis);
};

/**
 * Broadcast hourly analytics update to all clients.
 * @param {Object} stats - { room, avgTemp, avgAQI, totalEnergy, timestamp }
 */
const emitAnalyticsUpdate = (stats) => {
  if (!io) return;
  io.emit('analyticsUpdate', stats);
};

/**
 * Broadcast a room status change (active/inactive) to all clients.
 * @param {Object} room - Updated room document
 */
const emitRoomUpdate = (room) => {
  if (!io) return;
  io.emit('roomUpdate', {
    _id: room._id,
    name: room.name,
    status: room.status,
  });
};

/**
 * Broadcast an alert resolution event to all clients.
 * Useful for live-updating alert lists without polling.
 * @param {Object} alert - Resolved alert document
 */
const emitAlertResolved = (alert) => {
  if (!io) return;
  io.emit('alertResolved', {
    _id: alert._id,
    room: alert.room,
    resolvedAt: alert.resolvedAt,
    status: alert.status,
  });
};

module.exports = {
  initSocket,
  getIO,
  emitSensorUpdate,
  emitNewAlert,
  emitAiReasoning,
  emitAnalyticsUpdate,
  emitRoomUpdate,
  emitAlertResolved,
};
