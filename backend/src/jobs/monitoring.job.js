const cron = require('node-cron');
const Sensor = require('../modules/sensors/sensor.model');
const { checkThresholds } = require('../services/monitoringService');
const { createAlert } = require('../services/alertService');
const { emitNewAlert } = require('../services/socketManager');

const startMonitoringJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Get latest sensor data for each room
      const rooms = await Sensor.collection.distinct('room');

      for (const room of rooms) {
        const latest = await Sensor.findOne({ room }).sort({ timestamp: -1 });

        if (latest) {
          const violations = checkThresholds(latest.toObject());

          if (violations.length > 0) {
            for (const violation of violations) {
              const alert = await createAlert({
                room,
                message: violation.message,
                severity: violation.severity,
                sensorData: latest.toObject(),
                status: 'ACTIVE',
              });
              
              // Broadcast alert via socket
              emitNewAlert(alert.toObject());
            }
          }
        }
      }

    } catch (error) {
      console.error('[ERROR] Monitoring job error:', error.message);
    }
  });

  console.log('[JOBS] Monitoring job scheduled every 5 minutes');
};

module.exports = { startMonitoringJob };
