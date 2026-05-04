const express = require('express');

const router = express.Router();

const { getAdminStats } = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/auth');

// GET admin statistics
router.get(
    '/stats',
    protect,
    authorize('admin'),
    getAdminStats
);

module.exports = router;