const Sensor = require('../modules/sensors/sensor.model');

class SensorEngine {
  constructor() {
    this.rooms = [];
    this.interval = null;
  }

  addRoom(roomName, baseTemp = 24) {
    this.rooms.push({
      name: roomName,
      baseTemp,
      lastTemp: baseTemp,
    });
  }

  generateValue(base, variance = 2) {
    return parseFloat((base + (Math.random() - 0.5) * variance).toFixed(2));
  }

  async generateAndSave() {
    for (const room of this.rooms) {
      // Slight fluctuation in temperature
      const temp = this.generateValue(room.baseTemp, 3);
      room.lastTemp = temp;

      const sensorData = {
        room: room.name,
        temperature: temp,
        motion: Math.random() > 0.6,
        airQuality: this.generateValue(50, 40), // 10-90 range
        energyUsage: this.generateValue(300, 150), // 150-450W range
      };

      try {
        const sensor = await Sensor.create(sensorData);
        
        // Broadcast via socket
        const { emitSensorUpdate } = require('../services/socketManager');
        emitSensorUpdate(sensor.toObject());
      } catch (error) {
        console.error('[ERROR] Sensor save error:', error.message);
      }
    }
  }

  start(intervalMs = 3000) {
    if (this.interval) return;

    console.log('[SENSOR] Engine started (interval: ' + intervalMs + 'ms)');
    this.interval = setInterval(() => this.generateAndSave(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[SENSOR] Engine stopped');
    }
  }
}

module.exports = new SensorEngine();
