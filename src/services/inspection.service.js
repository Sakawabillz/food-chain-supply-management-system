const Inspection = require('../models/inspection.model');
const Batch = require('../models/batch.model');
const BATCH_STATUS = require('../constants/batchStatus');
const ROLES = require('../constants/roles');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateInspectionCode = async () => {
  const count = await Inspection.countDocuments();
  const padded = String(count + 1).padStart(3, '0');
  return `INSP-${padded}`;
};

// ─── Create Inspection ────────────────────────────────────────────────────────

const createInspection = async ({ batchId, result, remarks, inspectionDate }, inspectorId) => {

  //Check batch exists
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw createError(404, 'Batch not found');
  }

  //Enforce sequence — batch must be DELIVERED before inspection
  // This also implicitly blocks REJECTED and INSPECTED batches
  if (batch.status !== BATCH_STATUS.DELIVERED) {
  throw createError(400, `Batch cannot be inspected at this stage. Current status: ${batch.status}`);
  }

  //Prevent double inspection — check if a PASSED inspection already exists
  const existingInspection = await Inspection.findOne({
    batch: batchId,
    result: 'PASSED'
  });
  if (existingInspection) {
    throw createError(400, 'This batch has already passed inspection');
  }

  //Determine new batch status based on result
  const newBatchStatus = result === 'PASSED'
    ? BATCH_STATUS.INSPECTED
    : BATCH_STATUS.REJECTED;

  //Generate inspection code
  const inspectionCode = await generateInspectionCode();

  //Record the batch status before change
  const batchStatusBefore = batch.status;

  //Update batch status and append to statusHistory
  batch.status = newBatchStatus;
  batch.statusHistory.push({
    status: newBatchStatus,
    changedBy: inspectorId,
    note: `Inspection ${result}: ${remarks}`
  });
  await batch.save();

  //Create and return the inspection record
  const inspection = await Inspection.create({
    inspectionCode,
    batch: batchId,
    inspector: inspectorId,
    inspectionDate: inspectionDate || new Date(),
    result,
    remarks,
    batchStatusBefore,
    batchStatusAfter: newBatchStatus
  });

  return inspection.populate([
    { path: 'batch', select: 'batchCode productName status' },
    { path: 'inspector', select: 'name email role' }
  ]);
};

// ─── Get All Inspections ──────────────────────────────────────────────────────

const getAllInspections = async (user) => {
  let query = {};

  if (user.role === ROLES.INSPECTOR) {
    // Inspector sees only their own inspections
    query = { inspector: user._id };
  } else if (user.role === ROLES.FARMER) {
    // Farmer sees inspections of their batches only
    const farmerBatches = await Batch.find({ farmer: user._id }).select('_id');
    const batchIds = farmerBatches.map(b => b._id);
    query = { batch: { $in: batchIds } };
  }
  // ADMIN and DISTRIBUTOR get everything — query stays {}

  const inspections = await Inspection.find(query)
    .populate('batch', 'batchCode productName status')
    .populate('inspector', 'name email role')
    .sort({ createdAt: -1 });

  return inspections;
};

// ─── Get Single Inspection ────────────────────────────────────────────────────

const getInspectionById = async (inspectionId, user) => {
  const inspection = await Inspection.findById(inspectionId)
    .populate('batch', 'batchCode productName status farmer')
    .populate('inspector', 'name email role');

  if (!inspection) {
    throw createError(404, 'Inspection not found');
  }

  // FARMER can only see inspections of their own batches
  if (user.role === ROLES.FARMER) {
    const batchFarmerId = inspection.batch.farmer
      ? String(inspection.batch.farmer)
      : null;
    if (batchFarmerId !== String(user._id)) {
      throw createError(403, 'You do not have access to this inspection');
    }
  }

  // INSPECTOR can only see their own inspections
  if (user.role === ROLES.INSPECTOR) {
    if (String(inspection.inspector._id) !== String(user._id)) {
      throw createError(403, 'You do not have access to this inspection');
    }
  }

  return inspection;
};

module.exports = {
  createInspection,
  getAllInspections,
  getInspectionById
};