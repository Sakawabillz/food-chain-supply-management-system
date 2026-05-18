const Inspection = require('../models/inspection.model');
const Batch = require('../models/batch.model');
const BATCH_STATUS = require('../constants/batchStatus');
const ROLES = require('../constants/roles');
const { randomBytes } = require('crypto');
const logAction = require('../utils/logAction');

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getUserId = (user) => {
  return user && (user.id || user._id || user.userId);
};

const generateInspectionCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `INSP-${timestamp}-${random}`;
};

const populateInspection = (query) => {
  return query
    .populate({
      path: 'batch',
      select: 'batchCode productName status farmer',
      populate: {
        path: 'farmer',
        select: 'name email role'
      }
    })
    .populate('inspector', 'name email role');
};

const createInspection = async ({ batchId, result, remarks, inspectionDate }, inspectorId) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw createError(404, 'Batch not found');
  }

  if (batch.status !== BATCH_STATUS.DELIVERED) {
    throw createError(400, `Batch cannot be inspected at this stage. Current status: ${batch.status}`);
  }

  const existingInspection = await Inspection.findOne({ batch: batchId });

  if (existingInspection) {
    throw createError(400, 'This batch has already been inspected');
  }

  const batchStatusBefore = batch.status;
  const batchStatusAfter = result === 'PASSED'
    ? BATCH_STATUS.INSPECTED
    : BATCH_STATUS.REJECTED;

  const inspection = await Inspection.create({
    inspectionCode: generateInspectionCode(),
    batch: batchId,
    inspector: inspectorId,
    inspectionDate: inspectionDate || new Date(),
    result,
    remarks,
    batchStatusBefore,
    batchStatusAfter
  });

  batch.status = batchStatusAfter;
  batch.statusHistory.push({
    status: batchStatusAfter,
    changedBy: inspectorId,
    note: `Inspection ${result}: ${remarks}`
  });
  await batch.save();
  await logAction(
    inspectorId,
    result === 'PASSED' ? 'INSPECTION_PASS' : 'INSPECTION_FAIL',
    'Batch',
    batch._id,
    `Inspection ${inspection.inspectionCode} ${result}; batch marked ${batchStatusAfter}`
  );

  return populateInspection(Inspection.findById(inspection._id));
};

const getAllInspections = async (user) => {
  const userId = getUserId(user);
  let query = {};

  if (user.role === ROLES.INSPECTOR) {
    query = { inspector: userId };
  }

  if (user.role === ROLES.FARMER) {
    const batches = await Batch.find({ farmer: userId }).select('_id');
    query = { batch: { $in: batches.map((batch) => batch._id) } };
  }

  return populateInspection(Inspection.find(query).sort({ createdAt: -1 }));
};

const getInspectionById = async (inspectionId, user) => {
  const inspection = await populateInspection(Inspection.findById(inspectionId));

  if (!inspection) {
    throw createError(404, 'Inspection not found');
  }

  const userId = String(getUserId(user));

  if (user.role === ROLES.FARMER) {
    const farmer = inspection.batch && inspection.batch.farmer;

    if (!farmer || String(farmer._id || farmer) !== userId) {
      throw createError(403, 'You do not have access to this inspection');
    }
  }

  if (user.role === ROLES.INSPECTOR && String(inspection.inspector._id) !== userId) {
    throw createError(403, 'You do not have access to this inspection');
  }

  return inspection;
};

module.exports = {
  createInspection,
  getAllInspections,
  getInspectionById
};
