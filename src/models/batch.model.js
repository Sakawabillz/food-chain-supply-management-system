const mongoose = require('mongoose');
const BATCH_STATUS = require('../constants/batchStatus');

const batchSchema = new mongoose.Schema({
  batchCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  productName: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true 
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
    default: BATCH_STATUS.CREATED 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Batch', batchSchema);