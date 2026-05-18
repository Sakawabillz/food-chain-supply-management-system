const Shipment = require('../models/shipment.model');
const Batch = require('../models/batch.model');
const BATCH_STATUS = require('../constants/batchStatus');
const SHIPMENT_STATUS = require('../constants/shipmentStatus');
const ROLES = require('../constants/roles');
const logAction = require('../utils/logAction');

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getUserId = (user) => {
  return user && (user.id || user._id || user.userId);
};

const generateShipmentCode = () => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `SHIP-${suffix}`;
};

const populateShipment = (query) => {
  return query
    .populate({
      path: 'batch',
      select: 'batchCode productName farmer status',
      populate: {
        path: 'farmer',
        select: 'name email role'
      }
    })
    .populate('distributor', 'name email role');
};

const canReadShipment = (shipment, user) => {
  const userId = String(getUserId(user));

  if (user.role === ROLES.ADMIN || user.role === ROLES.INSPECTOR) {
    return true;
  }

  if (user.role === ROLES.DISTRIBUTOR) {
    return String(shipment.distributor._id || shipment.distributor) === userId;
  }

  if (user.role === ROLES.FARMER) {
    const farmer = shipment.batch && shipment.batch.farmer;
    return farmer && String(farmer._id || farmer) === userId;
  }

  return false;
};

const createShipment = async (payload, distributorId) => {
  const batch = await Batch.findById(payload.batchId);

  if (!batch) {
    throw createError(404, 'Batch not found');
  }

  if (batch.status !== BATCH_STATUS.HARVESTED) {
    throw createError(400, 'Only HARVESTED batches can be shipped');
  }

  const shipment = await Shipment.create({
    shipmentCode: payload.shipmentCode || generateShipmentCode(),
    batch: batch._id,
    distributor: distributorId,
    origin: payload.origin,
    destination: payload.destination,
    transportCompany: payload.transportCompany,
    departureDate: payload.departureDate,
    arrivalDate: payload.arrivalDate,
    status: SHIPMENT_STATUS.IN_TRANSIT
  });

  batch.status = BATCH_STATUS.IN_TRANSIT;
  batch.statusHistory.push({
    status: BATCH_STATUS.IN_TRANSIT,
    changedBy: distributorId,
    note: `Shipment ${shipment.shipmentCode} created`
  });
  await batch.save();
  await logAction(
    distributorId,
    'CREATE_SHIPMENT',
    'Shipment',
    shipment._id,
    `Created shipment ${shipment.shipmentCode} for batch ${batch.batchCode}`
  );

  return populateShipment(Shipment.findById(shipment._id));
};

const getShipments = async (user) => {
  const userId = getUserId(user);
  let query = {};

  if (user.role === ROLES.DISTRIBUTOR) {
    query = { distributor: userId };
  }

  if (user.role === ROLES.FARMER) {
    const batches = await Batch.find({ farmer: userId }).select('_id');
    query = { batch: { $in: batches.map((batch) => batch._id) } };
  }

  return populateShipment(Shipment.find(query).sort({ createdAt: -1 }));
};

const getShipmentById = async (id, user) => {
  const shipment = await populateShipment(Shipment.findById(id));

  if (!shipment) {
    return null;
  }

  if (!canReadShipment(shipment, user)) {
    throw createError(403, 'You are not allowed to view this shipment');
  }

  return shipment;
};

const markAsDelivered = async (id, distributorId) => {
  const shipment = await Shipment.findById(id);

  if (!shipment) {
    throw createError(404, 'Shipment not found');
  }

  if (String(shipment.distributor) !== String(distributorId)) {
    throw createError(403, 'Only the assigned distributor can deliver this shipment');
  }

  if (shipment.status !== SHIPMENT_STATUS.IN_TRANSIT) {
    throw createError(400, 'Only IN_TRANSIT shipments can be delivered');
  }

  const batch = await Batch.findById(shipment.batch);

  if (!batch) {
    throw createError(404, 'Linked batch not found');
  }

  const deliveredAt = new Date();
  shipment.status = SHIPMENT_STATUS.DELIVERED;
  shipment.arrivalDate = shipment.arrivalDate || deliveredAt;
  shipment.deliveredAt = deliveredAt;
  await shipment.save();

  batch.status = BATCH_STATUS.DELIVERED;
  batch.statusHistory.push({
    status: BATCH_STATUS.DELIVERED,
    changedBy: distributorId,
    note: `Shipment ${shipment.shipmentCode} delivered`
  });
  await batch.save();
  await logAction(
    distributorId,
    'DELIVER_SHIPMENT',
    'Shipment',
    shipment._id,
    `Delivered shipment ${shipment.shipmentCode}; batch marked ${BATCH_STATUS.DELIVERED}`
  );

  return populateShipment(Shipment.findById(shipment._id));
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  markAsDelivered
};
