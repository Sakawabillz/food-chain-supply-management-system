const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  passed: Boolean,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Inspection', InspectionSchema);
