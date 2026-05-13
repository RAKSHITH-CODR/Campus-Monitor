const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },
    sensorData: {
      temperature: Number,
      airQuality: Number,
      energyUsage: Number,
      motion: Boolean,
    },
    reasoning: {
      type: String,
      required: true,
    },
    actionTaken: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days TTL
    },
  },
  { timestamps: false }
);

// Compound index for room + date queries
aiLogSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('AILog', aiLogSchema);
