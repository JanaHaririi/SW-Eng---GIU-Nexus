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

// All routes require authentication AND admin role
router.use(protect);
router.use(authorize('admin'));

// GET /api/v1/users - Get all users (paginated, filterable)
router.get('/', getUsers);

// GET /api/v1/admin/stats - Platform statistics
router.get('/admin/stats', getAdminStats);

// GET /api/v1/users/:id - Get single user
router.get('/:id', getUserById);

// PATCH /api/v1/users/:id/status - Update user status (approve/reject)
router.patch('/:id/status', updateUserStatus);

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;