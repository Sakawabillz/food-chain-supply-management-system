const mongoose = require('mongoose');

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

const validateCreateShipment = (req, res, next) => {
  const errors = {};
  const {
    shipmentCode,
    batchId,
    origin,
    destination,
    transportCompany,
    departureDate,
    arrivalDate
  } = req.body;

  if (!batchId) {
    errors.batchId = 'Batch ID is required';
  } else if (!mongoose.Types.ObjectId.isValid(batchId)) {
    errors.batchId = 'Batch ID is invalid';
  }

  if (shipmentCode && typeof shipmentCode !== 'string') {
    errors.shipmentCode = 'Shipment code must be a string';
  }

  if (!origin || typeof origin !== 'string' || origin.trim().length === 0) {
    errors.origin = 'Origin is required';
  }

  if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
    errors.destination = 'Destination is required';
  }

  if (!departureDate || Number.isNaN(Date.parse(departureDate))) {
    errors.departureDate = 'A valid departure date is required';
  }

  if (arrivalDate && Number.isNaN(Date.parse(arrivalDate))) {
    errors.arrivalDate = 'Arrival date must be a valid date';
  }

  if (arrivalDate && departureDate && Date.parse(arrivalDate) < Date.parse(departureDate)) {
    errors.arrivalDate = 'Arrival date cannot be before departure date';
  }

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  if (shipmentCode) {
    req.body.shipmentCode = shipmentCode.trim().toUpperCase();
  }

  req.body.batchId = batchId;
  req.body.origin = origin.trim();
  req.body.destination = destination.trim();
  req.body.transportCompany = typeof transportCompany === 'string'
    ? transportCompany.trim()
    : transportCompany;
  req.body.departureDate = new Date(departureDate);

  if (arrivalDate) {
    req.body.arrivalDate = new Date(arrivalDate);
  }

  return next();
};

const validateShipmentId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendValidationError(res, { id: 'Invalid shipment id' });
  }

  return next();
};

module.exports = {
  validateCreateShipment,
  validateShipmentId
};
