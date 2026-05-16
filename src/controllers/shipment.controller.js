const shipmentService = require("../services/shipment.service");

const createShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.createShipment(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      data: shipment
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = "Shipment code already exists";
    }

    return next(error);
  }
};

const getAllShipments = async (req, res, next) => {
  try {
    const shipments = await shipmentService.getShipments(req.user);

    return res.status(200).json({
      success: true,
      data: shipments
    });
  } catch (error) {
    return next(error);
  }
};

const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id, req.user);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    return next(error);
  }
};

const markAsDelivered = async (req, res, next) => {
  try {
    const shipment = await shipmentService.markAsDelivered(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Shipment delivered successfully",
      data: shipment
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  markAsDelivered
};
