const express = require('express');
const router = express.Router();
const { getShips, getShipById, createShip, updateShip, deleteShip } = require('../controllers/shipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getShips)
  .post(protect, authorize('Admin', 'Ship Operator', 'Port Officer'), createShip);

router.route('/:id')
  .get(protect, getShipById)
  .put(protect, authorize('Admin', 'Ship Operator', 'Port Officer'), updateShip)
  .delete(protect, authorize('Admin'), deleteShip);

module.exports = router;
