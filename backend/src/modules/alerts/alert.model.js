const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'ACKNOWLEDGED'],
      default: 'ACTIVE',
    },
    sensorData: {
      temperature: Number,
      airQuality: Number,
      energyUsage: Number,
      motion: Boolean,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days TTL
    },
    resolvedAt: Date,
  },
  { timestamps: false }
);

// Compound index for room + date queries
alertSchema.index({ room: 1, createdAt: -1 });
// Index for filtering by severity and status
alertSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
