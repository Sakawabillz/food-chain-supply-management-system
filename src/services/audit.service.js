const mongoose = require("mongoose");
const Audit = require("../models/audit.model");

const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  details = "",
  metadata
}) => {
  try {
    if (!userId || !action || !entity || !entityId) {
      return null;
    }

    return await Audit.create({
      userId,
      action,
      entity,
      entityId,
      details,
      metadata
    });
  } catch (error) {
    console.error("Audit Log Error:", error.message);
    return null;
  }
};

const logAction = async (userId, action, entity, entityId, details = "", metadata) => {
  return createAuditLog({
    userId,
    action,
    entity,
    entityId,
    details,
    metadata
  });
};

const getAuditLogs = async (filters = {}, options = {}) => {
  const query = {};
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  if (filters.action) {
    query.action = String(filters.action).toUpperCase();
  }

  if (filters.entity) {
    query.entity = filters.entity;
  }

  if (filters.userId && mongoose.Types.ObjectId.isValid(filters.userId)) {
    query.userId = filters.userId;
  }

  if (filters.entityId && mongoose.Types.ObjectId.isValid(filters.entityId)) {
    query.entityId = filters.entityId;
  }

  const [logs, total] = await Promise.all([
    Audit.find(query)
      .populate("userId", "name email role")
      .sort({ timestamp: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Audit.countDocuments(query)
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getAuditLogById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Audit.findById(id).populate("userId", "name email role");
};

module.exports = {
  createAuditLog,
  logAction,
  getAuditLogs,
  getAuditLogById
};
