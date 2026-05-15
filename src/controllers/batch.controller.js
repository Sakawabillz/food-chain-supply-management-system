const batchService = require('../services/batch.service');
const apiResponse = require('../helpers/apiResponse');
const BATCH_STATUS = require('../constants/batchStatus');
const ROLES = require('../constants/roles');

const getUserId = (user) => {
  return user && (user.id || user._id || user.userId);
};

const getUserRole = (user) => {
  return String((user && user.role) || '').toUpperCase();
};

const requireAuthenticatedUser = (req, res) => {
  if (!req.user || !getUserId(req.user)) {
    apiResponse.error(res, 401, 'Authentication required');
    return false;
  }

  return true;
};

const isRole = (user, role) => getUserRole(user) === role;

const canUpdateStatus = (user, status) => {
  const role = getUserRole(user);

  if (role === ROLES.ADMIN) {
    return true;
  }

  if (role === ROLES.DISTRIBUTOR) {
    return status === BATCH_STATUS.IN_TRANSIT;
  }

  if (role === ROLES.INSPECTOR) {
    return status === BATCH_STATUS.INSPECTED || status === BATCH_STATUS.REJECTED;
  }

  return false;
};

const createBatch = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    if (!isRole(req.user, ROLES.FARMER)) {
      return apiResponse.error(res, 403, 'Only farmers can create batches');
    }

    const batch = await batchService.createBatch({
      batchCode: req.body.batchCode,
      productName: req.body.productName,
      quantity: req.body.quantity,
      unit: req.body.unit,
      farmer: getUserId(req.user),
      harvestDate: req.body.harvestDate
    }, getUserId(req.user));

    return res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch
    });
  } catch (error) {
    if (error.code === 11000) {
      return apiResponse.error(res, 409, 'Batch code already exists');
    }

    return next(error);
  }
};

const getBatches = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const query = isRole(req.user, ROLES.FARMER) ? { farmer: getUserId(req.user) } : {};
    const result = await batchService.getAllBatches(query, {
      page: req.query.page,
      limit: req.query.limit
    });

    return apiResponse.success(res, result);
  } catch (error) {
    return next(error);
  }
};

const getBatchById = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const batch = await batchService.getBatchById(req.params.id);

    if (!batch) {
      return apiResponse.error(res, 404, 'Batch not found');
    }

    if (isRole(req.user, ROLES.FARMER) && String(batch.farmer._id) !== String(getUserId(req.user))) {
      return apiResponse.error(res, 403, 'You can only view your own batches');
    }

    return apiResponse.success(res, batch);
  } catch (error) {
    return next(error);
  }
};

const getBatchHistory = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const batch = await batchService.getBatchHistory(req.params.id);

    if (!batch) {
      return apiResponse.error(res, 404, 'Batch not found');
    }

    if (isRole(req.user, ROLES.FARMER) && String(batch.farmer) !== String(getUserId(req.user))) {
      return apiResponse.error(res, 403, 'You can only view your own batch history');
    }

    return apiResponse.success(res, {
      batchCode: batch.batchCode,
      productName: batch.productName,
      currentStatus: batch.status,
      history: batch.statusHistory
    });
  } catch (error) {
    return next(error);
  }
};

const updateBatchStatus = async (req, res, next) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    if (!canUpdateStatus(req.user, req.body.status)) {
      return apiResponse.error(res, 403, 'You are not allowed to set this batch status');
    }

    const batch = await batchService.updateBatchStatus(
      req.params.id,
      req.body.status,
      getUserId(req.user)
    );

    if (!batch) {
      return apiResponse.error(res, 404, 'Batch not found');
    }

    return apiResponse.success(res, batch);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  getBatchHistory,
  updateBatchStatus
};
