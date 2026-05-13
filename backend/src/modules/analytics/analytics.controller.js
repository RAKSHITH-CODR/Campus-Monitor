const {
  getTemperatureTrend,
  getEnergyUsageTrend,
  getAQIReport,
  getRoomStatistics,
} = require('../../services/analyticsService');
const Room = require('../rooms/room.model');

const getTemperature = async (req, res, next) => {
  try {
    const { room, days } = req.query;
    if (!room) return res.status(400).json({ error: 'Room required' });

    // If room is an ID, fetch the room name
    let roomName = room;
    try {
      const roomDoc = await Room.findById(room);
      if (roomDoc) roomName = roomDoc.name;
    } catch (e) {
      // If it's not a valid ID, assume it's a name
      roomName = room;
    }

    const data = await getTemperatureTrend(roomName, days);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getEnergyUsage = async (req, res, next) => {
  try {
    const { room, days } = req.query;
    if (!room) return res.status(400).json({ error: 'Room required' });

    // If room is an ID, fetch the room name
    let roomName = room;
    try {
      const roomDoc = await Room.findById(room);
      if (roomDoc) roomName = roomDoc.name;
    } catch (e) {
      // If it's not a valid ID, assume it's a name
      roomName = room;
    }

    const data = await getEnergyUsageTrend(roomName, days);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getAQI = async (req, res, next) => {
  try {
    const { room, days } = req.query;
    if (!room) return res.status(400).json({ error: 'Room required' });

    // If room is an ID, fetch the room name
    let roomName = room;
    try {
      const roomDoc = await Room.findById(room);
      if (roomDoc) roomName = roomDoc.name;
    } catch (e) {
      // If it's not a valid ID, assume it's a name
      roomName = room;
    }

    const data = await getAQIReport(roomName, days);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const { room } = req.query;
    if (!room) return res.status(400).json({ error: 'Room required' });

    // If room is an ID, fetch the room name
    let roomName = room;
    try {
      const roomDoc = await Room.findById(room);
      if (roomDoc) roomName = roomDoc.name;
    } catch (e) {
      // If it's not a valid ID, assume it's a name
      roomName = room;
    }

    const stats = await getRoomStatistics(roomName);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTemperature, getEnergyUsage, getAQI, getStatistics };
