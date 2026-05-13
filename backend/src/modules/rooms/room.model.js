const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['classroom', 'lab', 'office', 'library', 'cafeteria', 'other'],
      default: 'classroom',
    },
    floor: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    normalTemperature: {
      type: Number,
      default: 24,
    },
    maxTemperature: {
      type: Number,
      default: 35,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('Room', roomSchema);
