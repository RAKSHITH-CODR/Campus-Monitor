const auditService = require('../../services/auditService');

/**
 * Audit Log Controller - Admin only endpoints to view audit logs
 */

const getMyAuditLogs = async (req, res, next) => {
  try {
    const { page = 1 } = req.pagination || {};
    const result = await auditService.getUserAuditLogs(req.user.userId, page, 15);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getEntityAuditLogs = async (req, res, next) => {
  try {
    const { entity, entityId } = req.params;
    const { page = 1 } = req.pagination || {};

    // Validate entity type
    const validEntities = ['Alert', 'Setting', 'Room', 'User', 'Sensor'];
    if (!validEntities.includes(entity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entity type',
        code: 'INVALID_ENTITY',
        valid: validEntities,
      });
    }

    const result = await auditService.getEntityAuditLogs(entity, entityId, page, 15);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAuditLogs,
  getEntityAuditLogs,
};
