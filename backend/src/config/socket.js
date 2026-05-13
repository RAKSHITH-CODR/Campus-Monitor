const { Server } = require('socket.io');
const env = require('./env');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('📡 Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('📡 Client disconnected:', socket.id);
    });
  });

  return io;
};

const getSocket = () => io;

module.exports = { initSocket, getSocket };
