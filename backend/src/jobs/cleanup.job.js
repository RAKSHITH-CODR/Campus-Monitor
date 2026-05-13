const cron = require('node-cron');
const Sensor = require('../modules/sensors/sensor.model');

const startCleanupJob = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Sensor.deleteMany({
        timestamp: { $lt: thirtyDaysAgo },
      });
    } catch (error) {
      console.error('[ERROR] Cleanup job error:', error.message);
    }
  });

  console.log('[JOBS] Cleanup job scheduled for 2 AM daily');
};

module.exports = { startCleanupJob };
