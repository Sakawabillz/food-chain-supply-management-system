const express = require("express");
const auditController = require("../controllers/audit.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  auditController.getAuditLogs
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  auditController.getAuditLogById
);

module.exports = router;
