const DockingRequest = require('../models/DockingRequest');
const Ship = require('../models/Ship');
const Berth = require('../models/Berth');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { allocateBerth } = require('../services/berthAllocationService');
const { sendDockingStatusEmail } = require('../services/notificationService');

// @desc    Get all docking requests
// @route   GET /api/docking
// @access  Private
exports.getDockingRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'Ship Operator') {
      const userShips = await Ship.find({ operatorId: req.user._id }).select('_id');
      filter.shipId = { $in: userShips.map(s => s._id) };
    }
    const requests = await DockingRequest.find(filter)
      .populate('shipId', 'shipName shipNumber capacity')
      .populate('assignedBerth', 'berthNumber location')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create a docking request
// @route   POST /api/docking
// @access  Private
exports.createDockingRequest = async (req, res) => {
  const { shipId, requestedArrival, requestedDeparture } = req.body;
  try {
    const ship = await Ship.findById(shipId);
    if (!ship) return res.status(404).json({ message: 'Ship not found' });

    const request = await DockingRequest.create({
      shipId,
      requestedArrival,
      requestedDeparture,
      status: 'Pending'
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) io.emit('dockingRequestCreated', { request, shipName: ship.shipName });

    res.status(201).json(request);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Update docking request (approve/reject + auto-allocate berth)
// @route   PUT /api/docking/:id
// @access  Private (Admin, Port Officer)
exports.updateDockingRequest = async (req, res) => {
  const { status, remarks } = req.body;
  try {
    const request = await DockingRequest.findById(req.params.id)
      .populate('shipId')
      .populate('assignedBerth');

    if (!request) return res.status(404).json({ message: 'Docking request not found' });

    const prevStatus = request.status;
    request.remarks = remarks || request.remarks;

    if (status === 'Approved' && prevStatus !== 'Approved') {
      // Auto-allocate a berth using the Smart Berth Allocation Algorithm
      const bestBerth = await allocateBerth(
        request.shipId.capacity,
        request.requestedArrival,
        request.requestedDeparture,
        request._id
      );

      if (!bestBerth) {
        return res.status(409).json({ message: 'No available berths match this request for the given dates.' });
      }

      // Assign the berth
      request.assignedBerth = bestBerth._id;
      request.status = 'Approved';

      // Update berth status to Occupied
      await Berth.findByIdAndUpdate(bestBerth._id, {
        status: 'Occupied',
        assignedShip: request.shipId._id
      });

      // Update ship status to Docked
      await Ship.findByIdAndUpdate(request.shipId._id, { status: 'Docked' });

      // Emit Socket.IO events
      const io = req.app.get('io');
      if (io) {
        io.emit('dockingApproved', {
          shipName: request.shipId.shipName,
          berthNumber: bestBerth.berthNumber
        });
      }

      // Send email notification
      const operator = await User.findById(request.shipId.operatorId);
      if (operator) {
        await sendDockingStatusEmail({
          toEmail: operator.email,
          toName: operator.name,
          shipName: request.shipId.shipName,
          status: 'Approved',
          remarks,
          berthNumber: bestBerth.berthNumber
        });
      }
    } else if (status === 'Rejected') {
      request.status = 'Rejected';

      // If it was previously approved, release the berth
      if (prevStatus === 'Approved' && request.assignedBerth) {
        await Berth.findByIdAndUpdate(request.assignedBerth._id, {
          status: 'Available',
          assignedShip: null
        });
        await Ship.findByIdAndUpdate(request.shipId._id, { status: 'Registered' });
      }

      const io = req.app.get('io');
      if (io) io.emit('dockingRejected', { shipName: request.shipId.shipName });

      const operator = await User.findById(request.shipId.operatorId);
      if (operator) {
        await sendDockingStatusEmail({
          toEmail: operator.email,
          toName: operator.name,
          shipName: request.shipId.shipName,
          status: 'Rejected',
          remarks
        });
      }
    }

    const updatedRequest = await request.save();

    // Log the activity
    await ActivityLog.create({
      userId: req.user._id,
      action: `${status} docking request for ship ${request.shipId.shipName}`,
      entity: 'DockingRequest'
    });

    res.json(await DockingRequest.findById(updatedRequest._id)
      .populate('shipId', 'shipName shipNumber capacity')
      .populate('assignedBerth', 'berthNumber location'));
  } catch (error) { res.status(500).json({ message: error.message }); }
};
