const mongoose = require('mongoose');
const SHIPMENT_STATUS = require('../constants/shipmentStatus');

const ShipmentSchema = new mongoose.Schema({
  shipmentCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  transportCompany: {
    type: String,
    trim: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  arrivalDate: {
    type: Date
  },
  status: {
    type: String,
    enum: Object.values(SHIPMENT_STATUS),
    default: SHIPMENT_STATUS.IN_TRANSIT
  },
  deliveredAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', ShipmentSchema);
