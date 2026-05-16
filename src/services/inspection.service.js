const mongoose = require('mongoose');
const Inspection = require('../models/inspection.model');
const Batch = require('../models/batch.model');
const BATCH_STATUS = require('../constants/batchStatus');
const ROLES = require('../constants/roles');
const { randomBytes } = require('crypto');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateInspectionCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `INSP-${timestamp}-${random}`;
};

// ─── Create Inspection ────────────────────────────────────────────────────────
const createInspection = async ({ batchId, result, remarks, inspectionDate }, inspectorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check batch exists — inside transaction
    const batch = await Batch.findById(batchId).session(session);
    if (!batch) {
      throw createError(404, 'Batch not found');
    }

    // 2. Enforce sequence — batch must be DELIVERED before inspection
    // This also implicitly blocks REJECTED and INSPECTED batches
    if (batch.status !== BATCH_STATUS.DELIVERED) {
      throw createError(400, `Batch cannot be inspected at this stage. Current status: ${batch.status}`);
    }

    // 3. Prevent double inspection — check if a PASSED inspection already exists
    // Inside transaction to prevent TOCTOU race condition
    const existingInspection = await Inspection.findOne({
      batch: batchId,
      result: 'PASSED'
    }).session(session);
    if (existingInspection) {
      throw createError(400, 'This batch has already passed inspection');
    }

    // 4. Determine new batch status based on result
    const newBatchStatus = result === 'PASSED'
      ? BATCH_STATUS.INSPECTED
      : BATCH_STATUS.REJECTED;

    // 5. Generate inspection code
    const inspectionCode = generateInspectionCode();

    // 6. Record batch status before change
    const batchStatusBefore = batch.status;

    // 7. Update batch status inside transaction
    batch.status = newBatchStatus;
    batch.statusHistory.push({
      status: newBatchStatus,
      changedBy: inspectorId,
      note: `Inspection ${result}: ${remarks}`
    });
    await batch.save({ session });

    // 8. Create inspection record inside same transaction
    const [inspection] = await Inspection.create(
      [
        {
          inspectionCode,
          batch: batchId,
          inspector: inspectorId,
          inspectionDate: inspectionDate || new Date(),
          result,
          remarks,
          batchStatusBefore,
          batchStatusAfter: newBatchStatus
        }
      ],
      { session }
    );

    // 9. Commit — both writes succeed or neither does
    await session.commitTransaction();

    let populatedInspection = inspection;
    try {
      populatedInspection = await inspection.populate([
        { path: 'batch', select: 'batchCode productName status' },
        { path: 'inspector', select: 'name email role' }
      ]);
    } catch (populateError) {
      console.warn('Inspection created successfully but population failed:', populateError);
    }

    return populatedInspection;

  } catch (error) {
    // Roll back everything if anything failed before commit
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
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
  if (!inspection.batch) {
    throw createError(404, 'The batch linked to this inspection no longer exists');
  }
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