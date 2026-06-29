const mongoose = require('mongoose');

const cargoSchema = new mongoose.Schema({
  shipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
  cargoType: { type: String, required: true },
  weight: { type: Number, required: true }, // in Tons
  destination: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'Loaded', 'Unloaded', 'Dispatched'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Cargo', cargoSchema);
