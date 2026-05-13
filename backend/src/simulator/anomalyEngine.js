const Sensor = require('../modules/sensors/sensor.model');

class AnomalyEngine {
  constructor() {
    this.interval = null;
    this.rooms = [];
  }

  addRoom(roomName) {
    this.rooms.push(roomName);
  }

  async injectAnomaly(roomName, anomalyType = 'temperature') {
    let update = {};

    switch (anomalyType) {
      case 'temperature':
        update = { temperature: 45 }; // Dangerous temperature
        break;
      case 'aqi':
        update = { airQuality: 250 }; // Unhealthy AQI
        break;
      case 'energy':
        update = { energyUsage: 900 }; // Critical energy usage
        break;
      case 'occupancy':
        update = { motion: true };
        break;
      default:
        update = { temperature: 42 };
    }

    try {
      const sensor = await Sensor.create({
        room: roomName,
        ...update,
        temperature: update.temperature || 24,
        airQuality: update.airQuality || 50,
        energyUsage: update.energyUsage || 300,
        motion: update.motion || false,
      });

      // Broadcast via socket
      const { broadcastSensorData } = require('../services/socketService');
      broadcastSensorData(sensor.toObject());
    } catch (error) {
      console.error('[ERROR] Anomaly injection error:', error.message);
    }
  }

  start(intervalMs = 30000) {
    if (this.interval) return;

    console.log('[ANOMALY] Engine started (interval: ' + intervalMs + 'ms)');
    this.interval = setInterval(() => {
      if (this.rooms.length > 0) {
        const randomRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
        const anomalies = ['temperature', 'aqi', 'energy', 'occupancy'];
        const randomAnomaly = anomalies[Math.floor(Math.random() * anomalies.length)];
        this.injectAnomaly(randomRoom, randomAnomaly);
      }
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('🔥 Anomaly engine stopped');
    }
  }
}

module.exports = new AnomalyEngine();
