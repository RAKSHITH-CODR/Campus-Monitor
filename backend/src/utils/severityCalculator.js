const thresholds = require('./thresholds');

const calculateSeverity = (sensorData) => {
  let severity = 'LOW';

  // Temperature check
  if (sensorData.temperature > thresholds.temperature.critical.max) {
    severity = 'CRITICAL';
  } else if (sensorData.temperature > thresholds.temperature.warning.max) {
    severity = 'HIGH';
  }

  // AQI check
  if (sensorData.airQuality > thresholds.aqi.unhealthy.max) {
    severity = 'CRITICAL';
  } else if (sensorData.airQuality > thresholds.aqi.unhealthy_sensitive.max) {
    severity = 'HIGH';
  }

  // Energy usage check
  if (sensorData.energyUsage > thresholds.energyUsage.critical.min) {
    severity = 'CRITICAL';
  } else if (sensorData.energyUsage > thresholds.energyUsage.warning.max) {
    severity = 'HIGH';
  }

  return severity;
};

module.exports = { calculateSeverity };
