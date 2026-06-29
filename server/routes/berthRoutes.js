const express = require('express');
const router = express.Router();
const { getBerths, createBerth, updateBerth, deleteBerth } = require('../controllers/berthController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBerths)
  .post(protect, authorize('Admin'), createBerth);

router.route('/:id')
  .put(protect, authorize('Admin', 'Port Officer'), updateBerth)
  .delete(protect, authorize('Admin'), deleteBerth);

module.exports = router;
