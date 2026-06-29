const mongoose = require('mongoose');

const dockingRequestSchema = new mongoose.Schema({
  shipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
  requestedArrival: { type: Date, required: true },
  requestedDeparture: { type: Date, required: true },
  assignedBerth: { type: mongoose.Schema.Types.ObjectId, ref: 'Berth', default: null },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DockingRequest', dockingRequestSchema);
