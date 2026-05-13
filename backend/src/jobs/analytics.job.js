const cron = require('node-cron');
const { getRoomStatistics } = require('../services/analyticsService');
const Room = require('../modules/rooms/room.model');
const { broadcastAnalytics } = require('../services/socketService');

const startAnalyticsJob = () => {
  // Run hourly
  cron.schedule('0 * * * *', async () => {
    try {
      const rooms = await Room.find({ status: 'active' });
      const analyticsData = {};

      for (const room of rooms) {
        const stats = await getRoomStatistics(room.name);
        if (stats) {
          analyticsData[room.name] = stats;
        }
      }

      // Broadcast via socket
      broadcastAnalytics({
        timestamp: new Date(),
        data: analyticsData,
      });
    } catch (error) {
      console.error('[ERROR] Analytics job error:', error.message);
    }
  });

  console.log('[JOBS] Analytics job scheduled hourly');
};

module.exports = { startAnalyticsJob };
