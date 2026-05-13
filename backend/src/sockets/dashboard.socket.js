const setupDashboardSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('📡 Dashboard client connected:', socket.id);

    socket.on('request_live_data', (data) => {
      // Emit back to client
      socket.emit('live_data_response', {
        timestamp: new Date(),
        ...data,
      });
    });

    socket.on('disconnect', () => {
      console.log('📡 Dashboard client disconnected:', socket.id);
    });
  });
};

module.exports = { setupDashboardSocket };
