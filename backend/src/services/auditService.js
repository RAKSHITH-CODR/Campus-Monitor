const AuditLog = require('../modules/audit/audit.model');

/**
 * Audit Logging Service
 * Centralized logging for all entity changes
 */

const createAuditLog = async (auditData) => {
  try {
    const log = new AuditLog({
      action: auditData.action,
      entity: auditData.entity,
      entityId: auditData.entityId,
      userId: auditData.userId,
      changes: auditData.changes || {},
      description: auditData.description,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error.message);
    // Don't throw - audit logging shouldn't fail the main operation
  }
};

const logAlertResolve = async (alertId, userId, resolution, ipAddress, userAgent) => {
  return createAuditLog({
    action: 'RESOLVE',
    entity: 'Alert',
    entityId: alertId,
    userId,
    changes: {
      before: { status: 'active' },
      after: { status: 'resolved', resolution },
    },
    description: `Alert resolved: ${resolution}`,
    ipAddress,
    userAgent,
  });
};

const logAlertCreate = async (alertId, userId, alert, ipAddress, userAgent) => {
  return createAuditLog({
    action: 'CREATE',
    entity: 'Alert',
    entityId: alertId,
    userId,
    changes: {
      after: {
        room: alert.room,
        message: alert.message,
        severity: alert.severity,
      },
    },
    description: `Alert created: ${alert.message}`,
    ipAddress,
    userAgent,
  });
};

const logSettingsUpdate = async (settingsId, userId, changes, ipAddress, userAgent) => {
  return createAuditLog({
    action: 'UPDATE',
    entity: 'Setting',
    entityId: settingsId,
    userId,
    changes,
    description: 'Settings updated',
    ipAddress,
    userAgent,
  });
};

const logRoomCreate = async (roomId, userId, room, ipAddress, userAgent) => {
  return createAuditLog({
    action: 'CREATE',
    entity: 'Room',
    entityId: roomId,
    userId,
    changes: {
      after: room,
    },
    description: `Room created: ${room.name}`,
    ipAddress,
    userAgent,
  });
};

const logRoomUpdate = async (roomId, userId, before, after, ipAddress, userAgent) => {
  return createAuditLog({
    action: 'UPDATE',
    entity: 'Room',
    entityId: roomId,
    userId,
    changes: { before, after },
    description: 'Room updated',
    ipAddress,
    userAgent,
  });
};

const logUserDelete = async (userId, deletedUserId, email, ipAddress, userAgent) => {
  return createAuditLog({
    action: 'DELETE',
    entity: 'User',
    entityId: deletedUserId,
    userId,
    changes: {
      before: { email },
    },
    description: `User deleted: ${email}`,
    ipAddress,
    userAgent,
  });
};

const getUserAuditLogs = async (userId, page = 1, limit = 15) => {
  const skip = (page - 1) * limit;
  const logs = await AuditLog.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'email name role');

  const total = await AuditLog.countDocuments({ userId });
  const pages = Math.ceil(total / limit);

  return { logs, pagination: { page, limit, total, pages } };
};

const getEntityAuditLogs = async (entity, entityId, page = 1, limit = 15) => {
  const skip = (page - 1) * limit;
  const logs = await AuditLog.find({ entity, entityId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'email name role');

  const total = await AuditLog.countDocuments({ entity, entityId });
  const pages = Math.ceil(total / limit);

  return { logs, pagination: { page, limit, total, pages } };
};

module.exports = {
  createAuditLog,
  logAlertResolve,
  logAlertCreate,
  logSettingsUpdate,
  logRoomCreate,
  logRoomUpdate,
  logUserDelete,
  getUserAuditLogs,
  getEntityAuditLogs,
};
