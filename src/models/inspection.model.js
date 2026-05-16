const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  inspectionCode: {type: String, unique: true, trim: true},
  batchId: {type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true},
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  inspectionDate: {type: Date, required: true, default: Date.now},
  result: {type: String, enum: ["PASSED", "FAILED"], required: true},
  remarks: {type: String, trim: true, default: " "}
}, { timestamps: true });

module.exports = mongoose.model('Inspection', InspectionSchema);
