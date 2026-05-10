const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'supplier' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
