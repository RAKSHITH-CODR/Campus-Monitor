/**
 * AI Analytics Engine
 * Analyzes sensor data, detects anomalies, provides insights
 */

export class AIAnalyticsEngine {
  constructor() {
    this.historicalData = {};
    this.anomalies = [];
  }

  /**
   * Classify alert severity and type
   */
  classifyAlert(sensorData) {
    const { sensors } = sensorData;
    const alerts = [];

    // Temperature analysis
    if (sensors.temperature > 28) {
      alerts.push({
        type: 'TEMPERATURE',
        severity: sensors.temperature > 32 ? 'CRITICAL' : 'HIGH',
        message: `Temperature abnormally high: ${sensors.temperature}°C`,
        reason: 'Possible AC malfunction or equipment overuse',
        recommendation: 'Check AC unit, reduce occupancy if needed',
      });
    } else if (sensors.temperature < 15) {
      alerts.push({
        type: 'TEMPERATURE',
        severity: 'WARNING',
        message: `Temperature too low: ${sensors.temperature}°C`,
        reason: 'Heating system may be underperforming',
        recommendation: 'Increase heating, check thermostat',
      });
    }

    // Air Quality analysis
    if (sensors.aqi > 300) {
      alerts.push({
        type: 'AIR_QUALITY',
        severity: 'CRITICAL',
        message: `Hazardous air quality: AQI ${sensors.aqi}`,
        reason: 'Possible pollution event or ventilation failure',
        recommendation: 'Evacuate room, activate ventilation',
      });
    } else if (sensors.aqi > 150) {
      alerts.push({
        type: 'AIR_QUALITY',
        severity: 'HIGH',
        message: `Poor air quality: AQI ${sensors.aqi}`,
        reason: 'High occupancy or insufficient ventilation',
        recommendation: 'Open windows, reduce occupancy',
      });
    }

    // Smoke detection
    if (sensors.smoke) {
      alerts.push({
        type: 'FIRE',
        severity: 'CRITICAL',
        message: 'Smoke detected!',
        reason: 'Possible fire or smoke source',
        recommendation: 'Activate fire alarm, evacuate',
      });
    }

    // CO2 analysis
    if (sensors.co2 > 1200) {
      alerts.push({
        type: 'CO2',
        severity: 'HIGH',
        message: `High CO2 levels: ${sensors.co2} ppm`,
        reason: 'High occupancy reducing air quality',
        recommendation: 'Increase ventilation, reduce occupancy',
      });
    }

    // Power consumption analysis
    if (sensors.power > 5000) {
      alerts.push({
        type: 'POWER',
        severity: 'WARNING',
        message: `High power consumption: ${sensors.power}W`,
        reason: 'Excessive equipment usage or inefficiency',
        recommendation: 'Review equipment usage, optimize HVAC',
      });
    }

    // Unauthorized access
    if (sensors.unauthorizedAccess) {
      alerts.push({
        type: 'SECURITY',
        severity: 'CRITICAL',
        message: 'Unauthorized access detected!',
        reason: 'Door opened by unknown person',
        recommendation: 'Check security camera, verify identity',
      });
    }

    // Door open for too long
    if (sensors.doorStatus === 'OPEN') {
      alerts.push({
        type: 'SECURITY',
        severity: 'INFO',
        message: 'Door is open',
        reason: 'May be open intentionally',
        recommendation: 'Monitor if this is expected',
      });
    }

    return alerts;
  }

  /**
   * Calculate room health score (0-100)
   */
  calculateHealthScore(sensorData) {
    const { sensors } = sensorData;
    let score = 100;

    // Temperature (ideal: 20-24°C)
    if (sensors.temperature < 18 || sensors.temperature > 26) score -= 10;
    if (sensors.temperature < 15 || sensors.temperature > 30) score -= 15;

    // Humidity (ideal: 40-60%)
    if (sensors.humidity < 30 || sensors.humidity > 70) score -= 5;

    // Air Quality (ideal: < 50 AQI)
    if (sensors.aqi > 100) score -= 15;
    if (sensors.aqi > 200) score -= 25;

    // CO2 (ideal: < 800 ppm)
    if (sensors.co2 > 1000) score -= 10;
    if (sensors.co2 > 1500) score -= 20;

    // Smoke = critical issue
    if (sensors.smoke) score -= 50;

    // Noise (ideal: < 50 dB)
    if (sensors.noise > 70) score -= 10;
    if (sensors.noise > 85) score -= 20;

    return Math.max(0, score);
  }

  /**
   * Analyze trends from historical data
   */
  analyzeTrends(roomId, historicalDataPoints) {
    if (!historicalDataPoints || historicalDataPoints.length < 2) {
      return null;
    }

    const latest = historicalDataPoints[historicalDataPoints.length - 1];
    const previous = historicalDataPoints[historicalDataPoints.length - 2];

    const trends = {};

    // Calculate changes
    for (const key in latest.sensors) {
      const latestVal = latest.sensors[key];
      const prevVal = previous.sensors[key];

      if (typeof latestVal === 'number' && typeof prevVal === 'number') {
        const change = latestVal - prevVal;
        const percentChange = ((change / Math.abs(prevVal)) * 100).toFixed(1);

        trends[key] = {
          current: latestVal,
          previous: prevVal,
          change: change,
          percentChange: percentChange,
          direction: change > 0 ? 'UP' : change < 0 ? 'DOWN' : 'STABLE',
        };
      }
    }

    return trends;
  }

  /**
   * Generate AI reasoning explanation
   */
  generateReasoning(roomId, sensorData, alerts) {
    const { sensors } = sensorData;
    const reasoning = [];

    reasoning.push(`[Analyzing ${roomId}...]`);
    reasoning.push(`Occupancy: ${sensors.occupancy} people`);

    if (sensors.occupancy > 0) {
      reasoning.push(`High occupancy detected.`);
      reasoning.push(`Cross-checking environmental factors...`);

      if (sensors.temperature > 25) {
        reasoning.push(
          `Temperature elevated (${sensors.temperature}°C). Possible causes:`
        );
        reasoning.push(
          `  - High occupancy generating heat: ${((sensors.occupancy / 60) * 100).toFixed(0)}%`
        );
        reasoning.push(`  - HVAC may be insufficient`);
      }

      if (sensors.aqi > 100) {
        reasoning.push(
          `Air quality degraded. High occupancy correlates with:`
        );
        reasoning.push(`  - CO2 levels: ${sensors.co2} ppm`);
        reasoning.push(`  - AQI index: ${sensors.aqi}`);
        reasoning.push(`  Recommendation: Increase ventilation`);
      }
    } else {
      reasoning.push(`Room unoccupied. Baseline readings:`);
      reasoning.push(
        `  Temperature: ${sensors.temperature}°C (normal)`
      );
      reasoning.push(`  AQI: ${sensors.aqi} (normal)`);
    }

    if (alerts.length > 0) {
      reasoning.push(`\n⚠️  Alerts generated: ${alerts.length}`);
      alerts.forEach((alert) => {
        reasoning.push(`  - ${alert.severity}: ${alert.message}`);
      });
    } else {
      reasoning.push(`✅ No critical alerts. Room status: NORMAL`);
    }

    return reasoning;
  }

  /**
   * Predict next hour conditions
   */
  predictNextHour(sensorData) {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 3600000);
    const occupancyIncrease = Math.random() * 0.2; // Can increase by 0-20%

    return {
      timestamp: nextHour.toISOString(),
      predictedOccupancy: Math.round(sensorData.sensors.occupancy * (1 + occupancyIncrease)),
      predictedTemperature: sensorData.sensors.temperature + (Math.random() - 0.5) * 2,
      predictedAQI: sensorData.sensors.aqi + (Math.random() - 0.5) * 20,
      predictedPower: sensorData.sensors.power * (1 + occupancyIncrease * 0.5),
      confidence: 0.75, // 75% confidence
    };
  }

  /**
   * Get room energy efficiency
   */
  calculateEnergyEfficiency(sensorData) {
    const { sensors } = sensorData;
    const occupancyRatio = Math.min(sensors.occupancy / 60, 1);
    const powerEfficiency = sensors.power / (occupancyRatio * 5000 + 1);

    return {
      score: Math.max(0, Math.min(100, 100 - powerEfficiency * 10)),
      powerPerPerson: occupancyRatio > 0 ? (sensors.power / sensors.occupancy).toFixed(1) : 0,
      recommendation:
        powerEfficiency > 2
          ? 'High power consumption. Optimize HVAC or equipment usage.'
          : 'Energy usage within acceptable range.',
    };
  }

  /**
   * Analyze daily patterns (if historical data available)
   */
  analyzeDailyPatterns(roomId, dataPoints = []) {
    if (dataPoints.length < 10) return null;

    const hourlyStats = {};

    dataPoints.forEach((data) => {
      const hour = new Date(data.timestamp).getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = {
          temperatures: [],
          occupancies: [],
          powerUsages: [],
        };
      }
      hourlyStats[hour].temperatures.push(data.sensors.temperature);
      hourlyStats[hour].occupancies.push(data.sensors.occupancy);
      hourlyStats[hour].powerUsages.push(data.sensors.power);
    });

    const patterns = {};
    for (const hour in hourlyStats) {
      const stats = hourlyStats[hour];
      patterns[hour] = {
        avgTemp:
          (stats.temperatures.reduce((a, b) => a + b) / stats.temperatures.length).toFixed(1),
        avgOccupancy: Math.round(
          stats.occupancies.reduce((a, b) => a + b) / stats.occupancies.length
        ),
        avgPower: Math.round(
          stats.powerUsages.reduce((a, b) => a + b) / stats.powerUsages.length
        ),
        peakHour: parseInt(hour),
      };
    }

    return patterns;
  }

  /**
   * Generate AI-powered recommendation
   */
  generateRecommendation(sensorData, alerts) {
    const { sensors } = sensorData;
    const recommendations = [];

    if (sensors.occupancy > 50) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Increase ventilation capacity',
        reason: 'High occupancy detected',
      });
    }

    if (sensors.aqi > 150) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Open windows or activate emergency ventilation',
        reason: 'Air quality deteriorating',
      });
    }

    if (sensors.temperature > 27) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Lower thermostat by 2-3 degrees',
        reason: 'Room overheating',
      });
    }

    if (sensors.power > 4500) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review equipment usage, defer non-essential loads',
        reason: 'Peak power consumption',
      });
    }

    if (sensors.humidity > 70) {
      recommendations.push({
        priority: 'LOW',
        action: 'Increase dehumidification',
        reason: 'High humidity levels',
      });
    }

    return recommendations;
  }
}
