const Sensor = require('../modules/sensors/sensor.model');

const getTemperatureTrend = async (room, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rawData = await Sensor.find(
      { room, timestamp: { $gte: startDate } },
      { temperature: 1, timestamp: 1 }
    ).sort({ timestamp: 1 });

    // Transform data for Recharts
    return rawData.map(doc => ({
      timestamp: doc.timestamp,
      value: doc.temperature
    }));
  } catch (error) {
    console.error('❌ Analytics error:', error.message);
    throw error;
  }
};

const getEnergyUsageTrend = async (room, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rawData = await Sensor.find(
      { room, timestamp: { $gte: startDate } },
      { energyUsage: 1, timestamp: 1 }
    ).sort({ timestamp: 1 });

    // Transform data for Recharts
    return rawData.map(doc => ({
      timestamp: doc.timestamp,
      value: doc.energyUsage
    }));
  } catch (error) {
    console.error('❌ Analytics error:', error.message);
    throw error;
  }
};

const getAQIReport = async (room, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rawData = await Sensor.find(
      { room, timestamp: { $gte: startDate } },
      { airQuality: 1, timestamp: 1 }
    ).sort({ timestamp: 1 });

    // Transform data for Recharts
    return rawData.map(doc => ({
      timestamp: doc.timestamp,
      value: doc.airQuality
    }));
  } catch (error) {
    console.error('❌ Analytics error:', error.message);
    throw error;
  }
};

const getRoomStatistics = async (room) => {
  try {
    const data = await Sensor.find({ room });

    if (!data.length) return null;

    const temps = data.map((d) => d.temperature);
    const aqi = data.map((d) => d.airQuality);
    const energy = data.map((d) => d.energyUsage);

    return {
      temperature: {
        avg: (temps.reduce((a, b) => a + b) / temps.length).toFixed(2),
        min: Math.min(...temps),
        max: Math.max(...temps),
      },
      airQuality: {
        avg: (aqi.reduce((a, b) => a + b) / aqi.length).toFixed(2),
        min: Math.min(...aqi),
        max: Math.max(...aqi),
      },
      energyUsage: {
        avg: (energy.reduce((a, b) => a + b) / energy.length).toFixed(2),
        min: Math.min(...energy),
        max: Math.max(...energy),
      },
    };
  } catch (error) {
    console.error('❌ Statistics error:', error.message);
    throw error;
  }
};

module.exports = {
  getTemperatureTrend,
  getEnergyUsageTrend,
  getAQIReport,
  getRoomStatistics,
};
