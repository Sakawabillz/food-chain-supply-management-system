const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
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
      enum: ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'IN_TRANSIT'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Shipment', shipmentSchema);