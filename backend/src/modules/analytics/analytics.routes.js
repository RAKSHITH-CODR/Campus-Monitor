const express = require('express');
const {
  getTemperature,
  getEnergyUsage,
  getAQI,
  getStatistics,
} = require('./analytics.controller');
const { limiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.get('/temperature', limiter, getTemperature);
router.get('/energy', limiter, getEnergyUsage);
router.get('/aqi', limiter, getAQI);
router.get('/statistics', limiter, getStatistics);

module.exports = router;
