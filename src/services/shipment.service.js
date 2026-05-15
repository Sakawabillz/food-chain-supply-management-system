const Shipment = require('../models/shipment.model');
const Batch = require('../models/batch.model');
const BATCH_STATUS = require('../constants/batchStatus');

class ShipmentService {
  // CREATE SHIPMENT
  async createShipment(data, distributorId) {
    const batch = await Batch.findById(data.batch);

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Batch must be HARVESTED
    if (batch.status !== BATCH_STATUS.HARVESTED) {
      throw new Error(
        `Batch cannot be shipped. Current status: ${batch.status}`
      );
    }

    // Create shipment
    const shipment = await Shipment.create({
      shipmentCode: data.shipmentCode,
      batch: batch._id,
      distributor: distributorId,
      origin: data.origin,
      destination: data.destination,
      transportCompany: data.transportCompany,
      departureDate: data.departureDate,
      arrivalDate: data.arrivalDate,
      status: 'IN_TRANSIT'
    });

    // Update batch status
    batch.status = BATCH_STATUS.IN_TRANSIT;

    batch.statusHistory.push({
      status: BATCH_STATUS.IN_TRANSIT,
      changedBy: distributorId,
      note: 'Batch shipment created'
    });

    await batch.save();

    return shipment;
  }

  // MARK SHIPMENT DELIVERED
  async markDelivered(shipmentId, distributorId) {
    const shipment = await Shipment.findById(shipmentId);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Ensure shipment belongs to distributor
    if (
      shipment.distributor.toString() !== distributorId.toString()
    ) {
      throw new Error(
        'Unauthorized to update this shipment'
      );
    }

    // Prevent double delivery
    if (shipment.status === 'DELIVERED') {
      throw new Error('Shipment already delivered');
    }

    // Update shipment status
    shipment.status = 'DELIVERED';
    shipment.arrivalDate = new Date();

    await shipment.save();

    // Update batch status
    const batch = await Batch.findById(shipment.batch);

    batch.status = BATCH_STATUS.DELIVERED;

    batch.statusHistory.push({
      status: BATCH_STATUS.DELIVERED,
      changedBy: distributorId,
      note: 'Shipment delivered'
    });

    await batch.save();

    return shipment;
  }
}

module.exports = new ShipmentService();