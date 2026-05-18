const { createAuditLog } = require("../services/audit.service");

const auditMiddleware = ({
  action,
  entity,
  getEntityId,
  getDetails,
  getMetadata
} = {}) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (!req.user || res.statusCode >= 400 || !action || !entity) {
        return;
      }

      const entityId = typeof getEntityId === "function" ? getEntityId(req, res) : req.params.id;

      if (!entityId) {
        return;
      }

      createAuditLog({
        userId: req.user.id || req.user._id,
        action,
        entity,
        entityId,
        details: typeof getDetails === "function" ? getDetails(req, res) : "",
        metadata: typeof getMetadata === "function" ? getMetadata(req, res) : undefined
      });
    });

    return next();
  };
};

module.exports = auditMiddleware;
