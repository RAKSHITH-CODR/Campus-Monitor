const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    motion: {
      type: Boolean,
      default: false,
    },
    airQuality: {
      type: Number,
      required: true,
    },
    energyUsage: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days TTL
    },
  },
  { timestamps: false }
);

// Compound index for efficient queries (covers room searches too)
sensorSchema.index({ room: 1, timestamp: -1 });

module.exports = mongoose.model('Sensor', sensorSchema);
