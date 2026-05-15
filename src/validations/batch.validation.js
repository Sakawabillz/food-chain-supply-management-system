const mongoose = require('mongoose');
const BATCH_STATUS = require('../constants/batchStatus');

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const normalizeStatus = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const status = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return Object.values(BATCH_STATUS).includes(status) ? status : null;
};

const createBatch = (req, res, next) => {
  const errors = {};
  const { batchCode, productName, quantity, unit, harvestDate } = req.body;
  const numericQuantity = Number(quantity);

  if (!isNonEmptyString(batchCode)) {
    errors.batchCode = 'Batch code is required';
  }

  if (!isNonEmptyString(productName)) {
    errors.productName = 'Product name is required';
  }

  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  if (!isNonEmptyString(unit)) {
    errors.unit = 'Unit is required';
  }

  if (!harvestDate || Number.isNaN(Date.parse(harvestDate))) {
    errors.harvestDate = 'A valid harvest date is required';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  req.body.batchCode = batchCode.trim().toUpperCase();
  req.body.productName = productName.trim();
  req.body.quantity = numericQuantity;
  req.body.unit = unit.trim();
  req.body.harvestDate = new Date(harvestDate);

  return next();
};

const batchId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendValidationError(res, { id: 'Invalid batch id' });
  }

  return next();
};

const updateStatus = (req, res, next) => {
  const status = normalizeStatus(req.body.status);
  const allowedStatuses = Object.values(BATCH_STATUS);

  if (!status) {
    return sendValidationError(res, {
      status: `Status must be one of: ${allowedStatuses.join(', ')}`
    });
  }

  req.body.status = status;
  return next();
};

module.exports = {
  createBatch,
  batchId,
  updateStatus
};
