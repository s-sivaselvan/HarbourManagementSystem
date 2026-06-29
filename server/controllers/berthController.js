const Berth = require('../models/Berth');

// @desc    Get all berths
// @route   GET /api/berths
// @access  Private
exports.getBerths = async (req, res) => {
  try {
    const berths = await Berth.find().populate('assignedShip', 'shipName shipNumber');
    res.json(berths);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create a berth
// @route   POST /api/berths
// @access  Private (Admin only)
exports.createBerth = async (req, res) => {
  try {
    const berth = new Berth(req.body);
    const createdBerth = await berth.save();
    res.status(201).json(createdBerth);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Update a berth
// @route   PUT /api/berths/:id
// @access  Private (Admin only)
exports.updateBerth = async (req, res) => {
  try {
    const berth = await Berth.findById(req.params.id);
    if (berth) {
      Object.assign(berth, req.body);
      const updatedBerth = await berth.save();
      res.json(updatedBerth);
    } else { res.status(404).json({ message: 'Berth not found' }); }
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Delete a berth
// @route   DELETE /api/berths/:id
// @access  Private (Admin only)
exports.deleteBerth = async (req, res) => {
  try {
    const berth = await Berth.findById(req.params.id);
    if (berth) {
      await berth.deleteOne();
      res.json({ message: 'Berth removed' });
    } else { res.status(404).json({ message: 'Berth not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};
