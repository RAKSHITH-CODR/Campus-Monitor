const { analyzeAnomaly } = require('../../services/aiService');
const Sensor = require('../sensors/sensor.model');
const Room = require('../rooms/room.model');

const analyzeData = async (req, res, next) => {
  try {
    const { room } = req.body;
    if (!room) return res.status(400).json({ error: 'Room ID required' });

    const roomInfo = await Room.findById(room);
    if (!roomInfo) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get latest sensor data by room name
    const sensorData = await Sensor.findOne({ room: roomInfo.name }).sort({ timestamp: -1 });

    if (!sensorData) {
      return res.status(404).json({ error: 'No recent sensor data found for this room. Please wait for data to arrive.' });
    }

    // Analyze with AI
    const analysis = await analyzeAnomaly(sensorData.toObject(), roomInfo.toObject());
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeData };
