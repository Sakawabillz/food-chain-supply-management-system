const inspectionService = require('../services/inspection.service');

const getUserId = (user) => {
  return user && (user.id || user._id || user.userId);
};

const createInspection = async (req, res, next) => {
  try {
    const inspection = await inspectionService.createInspection(
      req.body,
      getUserId(req.user)
    );

    return res.status(201).json({
      success: true,
      message: 'Inspection created successfully',
      data: inspection
    });
  } catch (error) {
    return next(error);
  }
};

const getAllInspections = async (req, res, next) => {
  try {
    const inspections = await inspectionService.getAllInspections(req.user);

    return res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    return next(error);
  }
};

const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await inspectionService.getInspectionById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: inspection
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createInspection,
  getAllInspections,
  getInspectionById
};
