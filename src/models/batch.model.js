const mongoose = require('mongoose');
const BATCH_STATUS = require('../constants/batchStatus');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(BATCH_STATUS),
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

const batchSchema = new mongoose.Schema({
  batchCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  productName: { 
    type: String, 
    required: true,
    trim: true
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [0.000001, 'Quantity must be greater than 0']
  },
  unit: { 
    type: String, 
    required: true,
    trim: true
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  harvestDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(BATCH_STATUS), 
    default: BATCH_STATUS.HARVESTED
  },
  statusHistory: [statusHistorySchema]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Batch', batchSchema);
