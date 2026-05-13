const { getSocket } = require('../config/socket');

const broadcastSensorData = (sensorData) => {
  const io = getSocket();
  if (io) {
    io.emit('sensorUpdate', sensorData);
    io.to(`room_${sensorData.room}`).emit('roomUpdate', sensorData);
  }
};

const broadcastAlert = (alert) => {
  const io = getSocket();
  if (io) {
    io.to('alerts_channel').emit('newAlert', alert);
    io.emit('newAlert', alert);
  }
};

const broadcastAIReasoning = (reasoning) => {
  const io = getSocket();
  if (io) {
    io.emit('aiReasoning', reasoning);
  }
};

const broadcastAnalytics = (analytics) => {
  const io = getSocket();
  if (io) {
    io.emit('analyticsUpdate', analytics);
  }
};

module.exports = {
  broadcastSensorData,
  broadcastAlert,
  broadcastAIReasoning,
  broadcastAnalytics,
};
