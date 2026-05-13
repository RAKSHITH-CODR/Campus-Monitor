const { z } = require('zod');
const Settings = require('./settings.model');
const auditService = require('../../services/auditService');

const settingsSchema = z.object({
  simulationMode: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  notifications: z.boolean().optional(),
  emailAlerts: z.object({
    enabled: z.boolean().optional(),
    recipients: z.array(z.string().email()).optional(),
  }).optional(),
  dataRetention: z.number().min(1).max(365).optional(),
  updateFrequency: z.number().min(1).max(60).optional(),
  alertSeverity: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])).optional(),
});

const getSettings = async (req, res, next) => {
  try {
    const { userId } = req.user; // From auth middleware
    
    let settings = await Settings.findOne({ userId });
    
    if (!settings) {
      // Create default settings
      settings = new Settings({ userId });
      await settings.save();
    }
    
    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const data = settingsSchema.parse(req.body);
    
    let settings = await Settings.findOne({ userId });
    const beforeSettings = settings ? JSON.parse(JSON.stringify(settings.toObject())) : {};
    
    if (!settings) {
      settings = new Settings({ userId, ...data });
    } else {
      Object.assign(settings, data);
    }
    
    await settings.save();

    // Log audit trail
    await auditService.logSettingsUpdate(
      settings._id,
      userId,
      { before: beforeSettings, after: data },
      req.ip,
      req.get('user-agent')
    );

    res.json({ message: 'Settings updated', data: settings });
  } catch (error) {
    next(error);
  }
};

const resetSettings = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    await Settings.updateOne(
      { userId },
      {
        simulationMode: true,
        darkMode: true,
        notifications: true,
        dataRetention: 30,
        updateFrequency: 3,
        alertSeverity: ['HIGH', 'CRITICAL'],
      }
    );
    
    const settings = await Settings.findOne({ userId });
    res.json({ message: 'Settings reset to defaults', data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, resetSettings };
