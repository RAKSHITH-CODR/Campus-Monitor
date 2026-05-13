const thresholds = {
  temperature: {
    normal: { min: 20, max: 26 },
    warning: { min: 15, max: 35 },
    critical: { min: 10, max: 40 },
  },
  aqi: {
    good: { max: 50 },
    moderate: { max: 100 },
    unhealthy_sensitive: { max: 150 },
    unhealthy: { max: 200 },
    very_unhealthy: { max: 300 },
    hazardous: { min: 301 },
  },
  energyUsage: {
    normal: { max: 500 },
    warning: { max: 750 },
    critical: { min: 751 },
  },
  motion: {
    occupiedThreshold: 1, // motion detected
  },
};

module.exports = thresholds;
