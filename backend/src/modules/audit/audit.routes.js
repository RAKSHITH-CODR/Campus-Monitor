const express = require('express');
const { getMyAuditLogs, getEntityAuditLogs } = require('./audit.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const { limiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');

const router = express.Router();

// Get user's own audit logs
router.get('/my-logs', limiter, authMiddleware, paginationMiddleware, getMyAuditLogs);

// Get audit logs for a specific entity (admin can query any, regular users can only query own)
router.get('/:entity/:entityId', limiter, authMiddleware, paginationMiddleware, getEntityAuditLogs);

module.exports = router;
