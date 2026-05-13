const Alert = require('../modules/alerts/alert.model');
const Room = require('../modules/rooms/room.model');
const Settings = require('../modules/settings/settings.model');
const { sendAlertEmail } = require('./emailService');

const createAlert = async (alertData, userId = null) => {
  try {
    const alert = new Alert(alertData);
    await alert.save();

    // Send email for CRITICAL and HIGH alerts
    if (['CRITICAL', 'HIGH'].includes(alert.severity)) {
      try {
        // Get user settings to check if email alerts are enabled
        if (userId) {
          const settings = await Settings.findOne({ userId });
          if (settings && settings.emailAlerts?.enabled && settings.emailAlerts?.recipients?.length > 0) {
            const room = await Room.findOne({ name: alert.room });
            const emailPromises = settings.emailAlerts.recipients.map(email =>
              sendAlertEmail(email, alert, room).catch(err =>
                console.error('[ALERT] Email sending failed for', email, ':', err.message)
              )
            );
            await Promise.all(emailPromises);
          }
        }
      } catch (emailError) {
        console.error('[ALERT] Error in email notification:', emailError.message);
        // Don't fail the alert creation if email fails
      }
    }

    return alert;
  } catch (error) {
    console.error('❌ Alert creation error:', error.message);
    throw error;
  }
};

const getAlerts = async (filters = {}, pagination = null) => {
  try {
    let query = Alert.find(filters).sort({ createdAt: -1 });
    
    if (pagination) {
      query = query.skip(pagination.skip).limit(pagination.limit);
      const total = await Alert.countDocuments(filters);
      const alerts = await query.exec();
      return { alerts, total };
    }
    
    return await query.limit(100);
  } catch (error) {
    console.error('❌ Alert retrieval error:', error.message);
    throw error;
  }
};

const resolveAlert = async (alertId) => {
  try {
    return await Alert.findByIdAndUpdate(
      alertId,
      { status: 'RESOLVED', resolvedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('❌ Alert resolution error:', error.message);
    throw error;
  }
};

module.exports = { createAlert, getAlerts, resolveAlert };
