const express = require('express');
const { createRoom, getAllRooms, getRoomById, updateRoom } = require('./room.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const { limiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('admin'), createRoom);
router.get('/', limiter, paginationMiddleware, getAllRooms);
router.get('/:id', limiter, getRoomById);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), updateRoom);

module.exports = router;
