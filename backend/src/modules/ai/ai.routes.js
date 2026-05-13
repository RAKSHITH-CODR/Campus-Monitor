const express = require('express');
const { analyzeData } = require('./ai.controller');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', authMiddleware, analyzeData);

module.exports = router;
