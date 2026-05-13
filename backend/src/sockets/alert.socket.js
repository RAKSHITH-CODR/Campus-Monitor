const setupAlertSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('subscribe_alerts', () => {
      socket.join('alerts_channel');
      console.log('📡 Client subscribed to alerts:', socket.id);
    });

    socket.on('unsubscribe_alerts', () => {
      socket.leave('alerts_channel');
      console.log('📡 Client unsubscribed from alerts:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('📡 Alert client disconnected:', socket.id);
    });
  });
};

module.exports = { setupAlertSocket };
