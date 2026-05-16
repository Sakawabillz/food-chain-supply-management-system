const mongoose = require('mongoose');
const BATCH_STATUS = require('../constants/batchStatus');

const inspectionSchema = new mongoose.Schema(
  {
    inspectionCode: {
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
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspectionDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    result: {
      type: String,
      enum: ['PASSED', 'FAILED'],
      required: true
    },
    remarks: {
      type: String,
      trim: true,
      required: true
    },
    batchStatusBefore: {
      type: String,
      enum: Object.values(BATCH_STATUS)
    },
    batchStatusAfter: {
      type: String,
      enum: Object.values(BATCH_STATUS)
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);