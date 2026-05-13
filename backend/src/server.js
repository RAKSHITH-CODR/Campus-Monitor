const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const env = require('./config/env');

// Import jobs
const { startCleanupJob } = require('./jobs/cleanup.job');
const { startAnalyticsJob } = require('./jobs/analytics.job');
const { startMonitoringJob } = require('./jobs/monitoring.job');

// Import simulator
const sensorEngine = require('./simulator/sensorEngine');
const anomalyEngine = require('./simulator/anomalyEngine');
const { getAllRooms } = require('./simulator/roomProfiles');

// Import socket handlers
const { setupSensorSocket } = require('./sockets/sensor.socket');
const { setupAlertSocket } = require('./sockets/alert.socket');
const { setupDashboardSocket } = require('./sockets/dashboard.socket');

const server = http.createServer(app);
const io = initSocket(server);

// Setup socket handlers
setupSensorSocket(io);
setupAlertSocket(io);
setupDashboardSocket(io);

const PORT = env.port;

const start = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create HTTP server
    server.listen(PORT, () => {
      console.log('[SERVER] Campus Monitor Backend running on port:', PORT);
      console.log('[SERVER] Frontend URL:', env.frontendUrl);
      console.log('[SERVER] Database: Connected');
    });

    // Initialize database with sample rooms
    const Room = require('./modules/rooms/room.model');
    const existingRooms = await Room.countDocuments();
    if (existingRooms === 0) {
      console.log('[SETUP] Seeding sample rooms...');
      const rooms = getAllRooms();
      await Room.insertMany(rooms);
      console.log('[SETUP] ' + rooms.length + ' sample rooms created');
    }

    // Initialize database with demo user
    const User = require('./modules/auth/user.model');
    const bcrypt = require('bcryptjs');
    const existingDemoUser = await User.findOne({ email: 'student@campus.edu' });
    if (!existingDemoUser) {
      console.log('[SETUP] Seeding demo user...');
      const hashedPassword = await bcrypt.hash('Demo@1234', 10);
      const demoUser = new User({
        name: 'Demo Student',
        email: 'student@campus.edu',
        password: hashedPassword,
        role: 'viewer'
      });
      await demoUser.save();
      console.log('[SETUP] Demo user created (student@campus.edu / Demo@1234)');
    }

    // Setup simulator
    const rooms = getAllRooms();
    rooms.forEach((room) => {
      sensorEngine.addRoom(room.name, room.normalTemperature);
      anomalyEngine.addRoom(room.name);
    });

    // Start engines
    sensorEngine.start(3000); // Every 3 seconds
    anomalyEngine.start(30000); // Every 30 seconds

    // Start background jobs
    startCleanupJob();
    startAnalyticsJob();
    startMonitoringJob();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('[SERVER] Shutting down gracefully...');
      sensorEngine.stop();
      anomalyEngine.stop();
      server.close(() => {
        console.log('[SERVER] Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
