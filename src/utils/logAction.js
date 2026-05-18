const { createAuditLog } = require("../services/audit.service");

const logAction = async (
  userId,
  action,
  entity,
  entityId,
  details = "",
  metadata
) => {
  return createAuditLog({
    userId,
    action,
    entity,
    entityId,
    details,
    metadata
  });
};

module.exports = logAction;
