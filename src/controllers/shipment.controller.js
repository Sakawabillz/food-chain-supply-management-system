const shipmentService = require("../services/shipment.service");

// creating shioment by distributor only
const createShipment = async (req, res) => {
  try {
    const distributorId = req.user._id; 
    const shipment = await shipmentService.createShipment(
      req.body,
      distributorId
    );
    return res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

//to get all shipments (role-based)
const getAllShipments = async (req, res) => {
  try {
    const shipments = await shipmentService.getShipments(req.user);
    return res.status(200).json({ success: true, data: shipments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// getting a single shipment
const getShipmentById = async (req, res) => {
  try {
    const shipment = await shipmentService.getShipmentById(
      req.params.id,
      req.user
    );
    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "shipment not found" });
    }
    return res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  mark shipment as delivered by distributor only
const markAsDelivered = async (req, res) => {
  try {
    const distributorId = req.user._id;
    const shipment = await shipmentService.markAsDelivered(
      req.params.id,
      distributorId
    );
    return res.status(200).json({
      success: true,
      message: "shipment is delivered",
      data: shipment,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  markAsDelivered,
};
