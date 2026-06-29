const Ship = require('../models/Ship');
const Berth = require('../models/Berth');
const DockingRequest = require('../models/DockingRequest');
const Cargo = require('../models/Cargo');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalShips,
      activeShips,
      dockedShips,
      totalBerths,
      availableBerths,
      occupiedBerths,
      pendingRequests,
      approvedRequests,
      cargoAgg,
      totalUsers,
      recentLogs,
      shipStatusBreakdown,
      monthlyDockings
    ] = await Promise.all([
      Ship.countDocuments(),
      Ship.countDocuments({ status: { $in: ['Registered', 'Docked'] } }),
      Ship.countDocuments({ status: 'Docked' }),
      Berth.countDocuments(),
      Berth.countDocuments({ status: 'Available' }),
      Berth.countDocuments({ status: 'Occupied' }),
      DockingRequest.countDocuments({ status: 'Pending' }),
      DockingRequest.countDocuments({ status: 'Approved' }),
      // Total cargo weight
      Cargo.aggregate([{ $group: { _id: null, totalWeight: { $sum: '$weight' } } }]),
      User.countDocuments(),
      // Recent activity logs
      ActivityLog.find().populate('userId', 'name role').sort('-timestamp').limit(10),
      // Ship status distribution for Pie Chart
      Ship.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      // Monthly docking requests for Line Chart (last 6 months)
      DockingRequest.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
          }
        },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      totalShips,
      activeShips,
      dockedShips,
      totalBerths,
      availableBerths,
      occupiedBerths,
      pendingRequests,
      approvedRequests,
      totalCargoWeight: cargoAgg[0]?.totalWeight || 0,
      totalUsers,
      recentLogs,
      shipStatusBreakdown,
      monthlyDockings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users list (Admin only)
// @route   GET /api/dashboard/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/dashboard/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get activity logs
// @route   GET /api/dashboard/logs
// @access  Private (Admin)
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('userId', 'name role').sort('-timestamp').limit(50);
    res.json(logs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
