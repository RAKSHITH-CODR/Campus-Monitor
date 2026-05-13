const express = require('express');
const { getAllAlerts, resolveAlertById, getActiveAlerts, exportAlerts } = require('./alert.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const { limiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');

const router = express.Router();

router.get('/', limiter, paginationMiddleware, getAllAlerts);
router.get('/active', limiter, paginationMiddleware, getActiveAlerts);
router.get('/export', limiter, authMiddleware, roleMiddleware('admin', 'manager'), exportAlerts);
router.patch('/:id/resolve', authMiddleware, roleMiddleware('admin', 'manager'), resolveAlertById);

module.exports = router;
