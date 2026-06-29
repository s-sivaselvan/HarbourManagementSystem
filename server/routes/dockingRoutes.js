const express = require('express');
const router = express.Router();
const { getDockingRequests, createDockingRequest, updateDockingRequest } = require('../controllers/dockingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDockingRequests)
  .post(protect, authorize('Admin', 'Ship Operator'), createDockingRequest);

router.route('/:id')
  .put(protect, authorize('Admin', 'Port Officer'), updateDockingRequest);

module.exports = router;
