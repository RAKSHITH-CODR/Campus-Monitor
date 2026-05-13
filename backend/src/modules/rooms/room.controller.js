const { z } = require('zod');
const Room = require('./room.model');
const Sensor = require('../sensors/sensor.model');
const { formatPaginatedResponse } = require('../../middleware/pagination');

const roomSchema = z.object({
  name: z.string(),
  type: z.string().optional().default('classroom'),
  floor: z.number(),
  capacity: z.number(),
  normalTemperature: z.number().optional().default(24),
  maxTemperature: z.number().optional().default(35),
});

const createRoom = async (req, res, next) => {
  try {
    const data = roomSchema.parse(req.body);
    const room = new Room(data);
    await room.save();
    res.status(201).json({ message: 'Room created', data: room });
  } catch (error) {
    next(error);
  }
};

const getAllRooms = async (req, res, next) => {
  try {
    const query = Room.find();
    const total = await Room.countDocuments();
    
    let rooms;
    if (req.pagination) {
      rooms = await query.skip(req.pagination.skip).limit(req.pagination.limit).exec();
    } else {
      rooms = await query.exec();
    }
    
    // Fetch latest sensor data for each room
    const roomsWithSensors = await Promise.all(
      rooms.map(async (room) => {
        const latestSensor = await Sensor.findOne({ room: room.name })
          .sort({ timestamp: -1 })
          .limit(1);
        
        return {
          ...room.toObject(),
          latestSensor: latestSensor || null,
        };
      })
    );
    
    if (req.pagination) {
      res.json(formatPaginatedResponse(roomsWithSensors, total, req.pagination));
    } else {
      res.json({ rooms: roomsWithSensors });
    }
  } catch (error) {
    next(error);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    // Fetch latest sensor data
    const latestSensor = await Sensor.findOne({ room: room.name })
      .sort({ timestamp: -1 })
      .limit(1);
    
    // Fetch sensor history (last 100 readings)
    const sensorHistory = await Sensor.find({ room: room.name })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ 
      room: {
        ...room.toObject(),
        latestSensor,
        sensorHistory,
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = roomSchema.partial().parse(req.body);
    const room = await Room.findByIdAndUpdate(id, data, { new: true });
    res.json({ message: 'Room updated', data: room });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoom, getAllRooms, getRoomById, updateRoom };
