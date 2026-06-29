const express = require('express');
const router = express.Router();
const { getCargo, createCargo, updateCargo, deleteCargo } = require('../controllers/cargoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCargo)
  .post(protect, authorize('Admin', 'Port Officer', 'Ship Operator'), createCargo);

router.route('/:id')
  .put(protect, authorize('Admin', 'Port Officer'), updateCargo)
  .delete(protect, authorize('Admin', 'Port Officer'), deleteCargo);

module.exports = router;
