const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  action: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Audit', AuditSchema);
