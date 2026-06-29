const Ship = require('../models/Ship');

// @desc    Get all ships
// @route   GET /api/ships
// @access  Private
exports.getShips = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'Ship Operator') {
      filter.operatorId = req.user._id;
    }
    const ships = await Ship.find(filter).populate('operatorId', 'name email');
    res.json(ships);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get single ship
// @route   GET /api/ships/:id
// @access  Private
exports.getShipById = async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id).populate('operatorId', 'name email');
    if (ship) res.json(ship);
    else res.status(404).json({ message: 'Ship not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create a ship
// @route   POST /api/ships
// @access  Private
exports.createShip = async (req, res) => {
  try {
    const ship = new Ship(req.body);
    if (req.user.role === 'Ship Operator') {
      ship.operatorId = req.user._id;
    }
    const createdShip = await ship.save();
    res.status(201).json(createdShip);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Update a ship
// @route   PUT /api/ships/:id
// @access  Private (Admin, Port Officer, or Operator who owns it)
exports.updateShip = async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id);
    if (ship) {
      Object.assign(ship, req.body);
      const updatedShip = await ship.save();
      res.json(updatedShip);
    } else { res.status(404).json({ message: 'Ship not found' }); }
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Delete a ship
// @route   DELETE /api/ships/:id
// @access  Private (Admin only)
exports.deleteShip = async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id);
    if (ship) {
      await ship.deleteOne();
      res.json({ message: 'Ship removed' });
    } else { res.status(404).json({ message: 'Ship not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};
