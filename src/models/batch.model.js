const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  product: String,
  status: String,
  origin: String
}, { timestamps: true });

module.exports = mongoose.model('Batch', BatchSchema);
