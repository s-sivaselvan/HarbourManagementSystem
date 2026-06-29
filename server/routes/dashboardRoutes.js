const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, deleteUser, getActivityLogs } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/users', protect, authorize('Admin'), getUsers);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);
router.get('/logs', protect, authorize('Admin'), getActivityLogs);

module.exports = router;
