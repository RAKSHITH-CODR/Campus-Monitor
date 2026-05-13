const { z } = require('zod');
const Sensor = require('./sensor.model');

const sensorSchema = z.object({
  room: z.string(),
  temperature: z.number(),
  motion: z.boolean().optional().default(false),
  airQuality: z.number(),
  energyUsage: z.number(),
});

const saveSensorData = async (req, res, next) => {
  try {
    const data = sensorSchema.parse(req.body);
    const sensor = new Sensor(data);
    await sensor.save();
    
    // Broadcast to WebSocket clients
    const { broadcastSensorData } = require('../../services/socketService');
    broadcastSensorData(sensor.toObject());
    
    res.status(201).json({ message: 'Sensor data saved', data: sensor });
  } catch (error) {
    next(error);
  }
};

const getLiveData = async (req, res, next) => {
  try {
    const { room } = req.query;
    const query = room ? { room } : {};

    const data = await Sensor.find(query).sort({ timestamp: -1 }).limit(10);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { room, days = 7 } = req.query;
    if (!room) return res.status(400).json({ error: 'Room required' });
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const data = await Sensor.find({
      room,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveSensorData, getLiveData, getHistory };
