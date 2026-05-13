const express = require('express');
const { register, login } = require('./auth.controller');
const { getAllUsers, updateUserRole, deleteUser } = require('./user.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const { strictLimiter, limiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');

const router = express.Router();

// Auth routes (public)
router.post('/register', strictLimiter, register);
router.post('/login', strictLimiter, login);

// User management routes (admin only)
router.get('/users', limiter, authMiddleware, roleMiddleware('admin'), paginationMiddleware, getAllUsers);
router.patch('/users/:userId/role', authMiddleware, roleMiddleware('admin'), updateUserRole);
router.delete('/users/:userId', authMiddleware, roleMiddleware('admin'), deleteUser);

module.exports = router;
