const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    simulationMode: {
      type: Boolean,
      default: true,
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    emailAlerts: {
      enabled: { type: Boolean, default: false },
      recipients: [String], // email addresses
    },
    dataRetention: {
      type: Number,
      default: 30, // days
      min: 1,
      max: 365,
    },
    updateFrequency: {
      type: Number,
      default: 3, // seconds
      min: 1,
      max: 60,
    },
    alertSeverity: {
      type: [String],
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: ['HIGH', 'CRITICAL'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
