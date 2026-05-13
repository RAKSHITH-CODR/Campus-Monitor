const Sensor = require('../modules/sensors/sensor.model');

const setupSensorSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('subscribe_room', (room) => {
      socket.join(`room_${room}`);
      console.log(`📡 Client subscribed to room: ${room}`);
    });

    socket.on('unsubscribe_room', (room) => {
      socket.leave(`room_${room}`);
      console.log(`📡 Client unsubscribed from room: ${room}`);
    });
  });
};

const broadcastSensorUpdate = (io, sensorData) => {
  io.emit('sensorUpdate', sensorData);
  io.to(`room_${sensorData.room}`).emit('roomUpdate', sensorData);
};

module.exports = { setupSensorSocket, broadcastSensorUpdate };
