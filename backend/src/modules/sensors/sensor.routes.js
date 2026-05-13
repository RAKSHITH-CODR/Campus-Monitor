const express = require('express');
const { saveSensorData, getLiveData, getHistory } = require('./sensor.controller');
const { limiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/save', limiter, saveSensorData);
router.get('/live', limiter, getLiveData);
router.get('/history', limiter, getHistory);

module.exports = router;
