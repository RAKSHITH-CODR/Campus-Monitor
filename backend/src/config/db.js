const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[ERROR] MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
