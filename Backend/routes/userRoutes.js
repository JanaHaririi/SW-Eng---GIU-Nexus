const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

const {
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getAdminStats
} = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Admin-only user management
 */

// All routes require authentication AND admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users (paginated, filterable) — admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [jobSeeker, recruiter, admin] }
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               page: 1
 *               total: 42
 *               users:
 *                 - { _id: "66312abf0b0a3d0012ef00aa", name: "Jana Hariri", email: "jana@student.giu-uni.de", role: "jobSeeker", recruiterStatus: "pending" }
 *       401: { description: Not authorized }
 *       403: { description: Admin role required }
 */
router.get('/', getUsers);

/**
 * @swagger
 * /users/admin/stats:
 *   get:
 *     tags: [Users]
 *     summary: Platform statistics — admin only
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregate counts
 *         content:
 *           application/json:
 *             example: { success: true, stats: { totalUsers: 142, jobSeekers: 110, recruiters: 28, admins: 4, totalJobs: 73 } }
 *       401: { description: Not authorized }
 *       403: { description: Admin role required }
 */
router.get('/admin/stats', getAdminStats);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by id — admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Mongo ObjectId of the user
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user: { _id: "66312abf0b0a3d0012ef00aa", name: "Jana Hariri", email: "jana@student.giu-uni.de", role: "recruiter", recruiterStatus: "approved" }
 *       404: { description: User not found }
 *       401: { description: Not authorized }
 *       403: { description: Admin role required }
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Approve or reject a recruiter account — admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recruiterStatus]
 *             properties:
 *               recruiterStatus: { type: string, enum: [pending, approved, rejected], example: approved }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             example: { success: true, message: "Recruiter approved" }
 *       400: { description: Invalid status value }
 *       404: { description: User not found }
 *       401: { description: Not authorized }
 *       403: { description: Admin role required }
 */
router.patch('/:id/status', updateUserStatus);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user — admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             example: { success: true, message: "User deleted" }
 *       404: { description: User not found }
 *       401: { description: Not authorized }
 *       403: { description: Admin role required }
 */
router.delete('/:id', deleteUser);

module.exports = router;