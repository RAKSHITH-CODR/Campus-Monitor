const Sensor = require('../modules/sensors/sensor.model');
const thresholds = require('../utils/thresholds');
const { calculateSeverity } = require('../utils/severityCalculator');

const checkThresholds = (sensorData) => {
  const violations = [];

  if (sensorData.temperature > thresholds.temperature.critical.max) {
    violations.push({
      type: 'temperature',
      message: `Temperature critically high: ${sensorData.temperature}°C`,
      severity: 'CRITICAL',
    });
  } else if (sensorData.temperature > thresholds.temperature.warning.max) {
    violations.push({
      type: 'temperature',
      message: `Temperature warning: ${sensorData.temperature}°C`,
      severity: 'HIGH',
    });
  }

  if (sensorData.airQuality > thresholds.aqi.unhealthy.max) {
    violations.push({
      type: 'airQuality',
      message: `Air Quality unhealthy: ${sensorData.airQuality}`,
      severity: 'CRITICAL',
    });
  }

  if (sensorData.energyUsage > thresholds.energyUsage.critical.min) {
    violations.push({
      type: 'energy',
      message: `Energy usage critical: ${sensorData.energyUsage}W`,
      severity: 'HIGH',
    });
  }

  return violations;
};

const isAnomalous = (sensorData) => {
  return calculateSeverity(sensorData) !== 'LOW';
};

module.exports = { checkThresholds, isAnomalous };
