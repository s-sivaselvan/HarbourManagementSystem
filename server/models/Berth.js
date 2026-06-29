const mongoose = require('mongoose');

const berthSchema = new mongoose.Schema({
  berthNumber: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true }, // in TEU or Tons matching Ship capacity
  status: { 
    type: String, 
    required: true,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  assignedShip: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Berth', berthSchema);
