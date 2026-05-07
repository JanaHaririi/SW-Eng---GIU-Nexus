const express = require('express');

const router = express.Router();

const { getAdminStats } = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin-only platform statistics
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Platform statistics — admin only
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregate counts
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats: { totalUsers: 142, jobSeekers: 110, recruiters: 28, admins: 4, totalJobs: 73, totalApplications: 318 }
 *       401: { description: Not authorized }
 *       403: { description: Admin role required }
 */
router.get(
    '/stats',
    protect,
    authorize('admin'),
    getAdminStats
);

module.exports = router;