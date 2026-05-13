const express = require('express');
const { getSettings, updateSettings, resetSettings } = require('./settings.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const { limiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.get('/', limiter, authMiddleware, getSettings);
router.patch('/', limiter, authMiddleware, updateSettings);
router.post('/reset', limiter, authMiddleware, roleMiddleware('admin'), resetSettings);

module.exports = router;
