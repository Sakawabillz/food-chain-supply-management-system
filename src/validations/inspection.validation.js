const mongoose = require('mongoose');

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

const normalizeResult = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const result = value.trim().toUpperCase();
  return ['PASSED', 'FAILED'].includes(result) ? result : null;
};

const createInspection = (req, res, next) => {
  const errors = {};
  const { batchId, result, remarks, inspectionDate } = req.body;
  const normalizedResult = normalizeResult(result);

  if (!batchId) {
    errors.batchId = 'Batch ID is required';
  } else if (!mongoose.Types.ObjectId.isValid(batchId)) {
    errors.batchId = 'Batch ID is invalid';
  }

  if (!normalizedResult) {
    errors.result = 'Result must be PASSED or FAILED';
  }

  if (!isNonEmptyString(remarks)) {
    errors.remarks = 'Remarks are required';
  }

  if (inspectionDate && Number.isNaN(Date.parse(inspectionDate))) {
    errors.inspectionDate = 'Inspection date must be a valid date';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  req.body.batchId = batchId;
  req.body.result = normalizedResult;
  req.body.remarks = remarks.trim();

  if (inspectionDate) {
    req.body.inspectionDate = new Date(inspectionDate);
  }

  return next();
};

const inspectionId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendValidationError(res, { id: 'Invalid inspection id' });
  }

  return next();
};

module.exports = {
  createInspection,
  inspectionId
};
