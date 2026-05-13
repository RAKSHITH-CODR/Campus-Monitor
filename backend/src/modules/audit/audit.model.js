const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESOLVE'],
      required: true,
    },
    entity: {
      type: String,
      enum: ['Alert', 'Setting', 'Room', 'User', 'Sensor'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed, // Previous values
      after: mongoose.Schema.Types.Mixed,   // New values
    },
    description: String,
    ipAddress: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 2592000, // Auto-delete after 30 days
    },
  },
  { collection: 'audit_logs' }
);

// Compound index for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, entity: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
