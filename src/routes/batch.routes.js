const express = require('express');
const batchController = require('../controllers/batch.controller');
const authenticate = require('../middlewares/auth.middleware');
const batchValidation = require('../validations/batch.validation');

const router = express.Router();

router.post(
  '/',
  authenticate,
  batchValidation.createBatch,
  batchController.createBatch
);

router.get('/', authenticate, batchController.getBatches);

router.get(
  '/:id',
  authenticate,
  batchValidation.batchId,
  batchController.getBatchById
);

router.get(
  '/:id/history',
  authenticate,
  batchValidation.batchId,
  batchController.getBatchHistory
);

router.patch(
  '/:id/status',
  authenticate,
  batchValidation.batchId,
  batchValidation.updateStatus,
  batchController.updateBatchStatus
);

module.exports = router;
