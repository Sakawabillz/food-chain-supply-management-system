const Batch = require('../models/batch.model');

const createBatch = async (batchData) => {
  const newBatch = await Batch.create(batchData);
  return newBatch;
};

const getAllBatches = async (query = {}) => {
  return await Batch.find(query).populate('farmer', 'name email');
};

const getBatchById = async (id) => {
  return await Batch.findById(id).populate('farmer', 'name email');
};

const updateBatchStatus = async (id, status) => {
  return await Batch.findByIdAndUpdate(id, { status }, { new: true });
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatchStatus
};