const Batch = require('../models/batch.model');
const User = require('../models/user.model');
const BATCH_STATUS = require('../constants/batchStatus');
const ROLES = require('../constants/roles');

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureFarmer = async (farmerId) => {
  const farmer = await User.findById(farmerId).select('role isActive');

  if (!farmer) {
    throw createError(404, 'Farmer not found');
  }

  if (!farmer.isActive || farmer.role !== ROLES.FARMER) {
    throw createError(403, 'Batch farmer must be an active FARMER user');
  }
};

const populateBatch = (query) => {
  return query
    .populate('farmer', 'name email role')
    .populate('statusHistory.changedBy', 'name email role');
};

const createBatch = async (batchData, actorId) => {
  await ensureFarmer(batchData.farmer);

  return Batch.create({
    ...batchData,
    status: BATCH_STATUS.HARVESTED,
    statusHistory: [{
      status: BATCH_STATUS.HARVESTED,
      changedBy: actorId || batchData.farmer,
      note: 'Batch created'
    }]
  });
};

const getAllBatches = async (query = {}, options = {}) => {
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [batches, total] = await Promise.all([
    Batch.find(query)
      .populate('farmer', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Batch.countDocuments(query)
  ]);

  return {
    batches,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getBatchById = async (id) => {
  return populateBatch(Batch.findById(id));
};

const getBatchHistory = async (id) => {
  return Batch.findById(id)
    .select('batchCode productName status farmer statusHistory')
    .populate('statusHistory.changedBy', 'name email role');
};

const updateBatchStatus = async (id, status, actorId) => {
  const batch = await Batch.findById(id);

  if (!batch) {
    return null;
  }

  batch.status = status;
  batch.statusHistory.push({
    status,
    changedBy: actorId,
    note: 'Status updated'
  });

  await batch.save();

  return populateBatch(Batch.findById(batch._id));
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  getBatchHistory,
  updateBatchStatus
};
