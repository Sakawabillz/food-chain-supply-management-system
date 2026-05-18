const auditService = require("../services/audit.service");

const getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(
      {
        action: req.query.action,
        entity: req.query.entity,
        userId: req.query.userId,
        entityId: req.query.entityId
      },
      {
        page: req.query.page,
        limit: req.query.limit
      }
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

const getAuditLogById = async (req, res, next) => {
  try {
    const log = await auditService.getAuditLogById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById
};
