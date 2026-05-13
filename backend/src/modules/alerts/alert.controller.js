const Alert = require('./alert.model');
const { createAlert, getAlerts, resolveAlert } = require('../../services/alertService');
const { formatPaginatedResponse } = require('../../middleware/pagination');
const { jsonToCSV, formatAlertsForExport } = require('../../services/exportService');
const auditService = require('../../services/auditService');

const getAllAlerts = async (req, res, next) => {
  try {
    const { room, severity, status } = req.query;
    const filters = {};

    if (room) filters.room = room;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;

    const result = await getAlerts(filters, req.pagination);
    
    if (result.total !== undefined) {
      res.json(formatPaginatedResponse(result.alerts, result.total, req.pagination));
    } else {
      res.json({ alerts: result });
    }
  } catch (error) {
    next(error);
  }
};

const exportAlerts = async (req, res, next) => {
  try {
    const { format = 'csv', room, severity, status } = req.query;
    const filters = {};

    if (room) filters.room = room;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;

    // Get all matching alerts (no pagination for export)
    let alerts = await Alert.find(filters).sort({ createdAt: -1 }).limit(10000);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="alerts-${Date.now()}.json"`);
      res.send(JSON.stringify(alerts, null, 2));
    } else {
      // CSV format
      const formatted = formatAlertsForExport(alerts);
      const csv = jsonToCSV(formatted);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="alerts-${Date.now()}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};

const resolveAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await resolveAlert(id);

    // Log audit trail
    await auditService.logAlertResolve(
      id,
      req.user.userId,
      alert?.resolution || 'Manual resolve',
      req.ip,
      req.get('user-agent')
    );

    res.json({ message: 'Alert resolved', alert });
  } catch (error) {
    next(error);
  }
};

const getActiveAlerts = async (req, res, next) => {
  try {
    const result = await getAlerts({ status: 'ACTIVE' }, req.pagination);
    
    if (result.total !== undefined) {
      res.json(formatPaginatedResponse(result.alerts, result.total, req.pagination));
    } else {
      res.json({ alerts: result });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllAlerts, resolveAlertById, getActiveAlerts, exportAlerts };
