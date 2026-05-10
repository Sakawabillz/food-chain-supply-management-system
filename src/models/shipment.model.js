const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  from: String,
  to: String,
  status: String
}, { timestamps: true });

module.exports = mongoose.model('Shipment', ShipmentSchema);
