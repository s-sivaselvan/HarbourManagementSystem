const Cargo = require('../models/Cargo');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all cargo
// @route   GET /api/cargo
// @access  Private
exports.getCargo = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shipId) filter.shipId = req.query.shipId;
    const cargo = await Cargo.find(filter).populate('shipId', 'shipName shipNumber');
    res.json(cargo);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create cargo record
// @route   POST /api/cargo
// @access  Private
exports.createCargo = async (req, res) => {
  try {
    const cargo = await Cargo.create(req.body);
    await ActivityLog.create({
      userId: req.user._id,
      action: `Added cargo '${cargo.cargoType}' (${cargo.weight} tons)`,
      entity: 'Cargo'
    });
    res.status(201).json(cargo);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Update cargo
// @route   PUT /api/cargo/:id
// @access  Private
exports.updateCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ message: 'Cargo not found' });
    Object.assign(cargo, req.body);
    const updatedCargo = await cargo.save();

    // Emit Socket.IO event for cargo status change
    const io = req.app.get('io');
    if (io) io.emit('cargoStatusUpdated', { cargoId: cargo._id, status: cargo.status });

    res.json(updatedCargo);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Delete cargo
// @route   DELETE /api/cargo/:id
// @access  Private (Admin, Port Officer)
exports.deleteCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ message: 'Cargo not found' });
    await cargo.deleteOne();
    res.json({ message: 'Cargo record removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
