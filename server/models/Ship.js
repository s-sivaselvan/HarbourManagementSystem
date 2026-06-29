const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema({
  shipName: { type: String, required: true },
  shipNumber: { type: String, required: true, unique: true },
  captainName: { type: String, required: true },
  shipType: { type: String, required: true },
  capacity: { type: Number, required: true }, // in TEU or Tons
  registrationCountry: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['Registered', 'Docked', 'Departed', 'Maintenance'],
    default: 'Registered'
  },
  arrivalDate: { type: Date },
  departureDate: { type: Date },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to Ship Operator
}, { timestamps: true });

module.exports = mongoose.model('Ship', shipSchema);
