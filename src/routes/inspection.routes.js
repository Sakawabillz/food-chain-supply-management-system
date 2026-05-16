const express = require('express');
const inspectionController = require('../controllers/inspection.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');
const inspectionValidation = require('../validations/inspection.validation');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.INSPECTOR),
  inspectionValidation.createInspection,
  inspectionController.createInspection
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.DISTRIBUTOR, ROLES.FARMER, ROLES.INSPECTOR),
  inspectionController.getAllInspections
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.DISTRIBUTOR, ROLES.FARMER, ROLES.INSPECTOR),
  inspectionValidation.inspectionId,
  inspectionController.getInspectionById
);

module.exports = router;
