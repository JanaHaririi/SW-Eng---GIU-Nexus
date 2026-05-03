const User = require('../models/user.schema');

// @desc    Get all users with pagination and filtering
// @route   GET /api/v1/users
// @access  Admin only
const getUsers = async (req, res, next) => {
    try {
        const { role, status, page = 1, limit = 20 } = req.query;

        // Build filter object
        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Execute queries in parallel
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user by ID
// @route   GET /api/v1/users/:id
// @access  Admin only
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        next(error);
    }
};

// @desc    Update user status (approve/reject/pending)
// @route   PATCH /api/v1/users/:id/status
// @access  Admin only
const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Validate status value
        const validStatuses = ['approved', 'rejected', 'pending'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { recruiterStatus: status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        next(error);
    }
};

// @desc    Delete user account
// @route   DELETE /api/v1/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        next(error);
    }
};

// @desc    Get platform statistics
// @route   GET /api/v1/admin/stats
// @access  Admin only
const getAdminStats = async (req, res, next) => {
    try {
        // Users by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Format usersByRole as object
        const usersByRoleObj = {};
        usersByRole.forEach(item => {
            usersByRoleObj[item._id] = item.count;
        });

        // Jobs by status (need JobPost model)
        const JobPost = require('../models/JobPost');
        const jobsByStatus = await JobPost.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const jobsByStatusObj = {};
        jobsByStatus.forEach(item => {
            jobsByStatusObj[item._id] = item.count;
        });

        // Applications by status (need Application model)
        const Application = require('../models/application.schema');        const appsByStatus = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const appsByStatusObj = {};
        appsByStatus.forEach(item => {
            appsByStatusObj[item._id] = item.count;
        });

        // Top 5 jobs by application count
        const topJobs = await Application.aggregate([
            { $group: { _id: '$job', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'jobposts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            { $unwind: '$jobDetails' },
            {
                $project: {
                    _id: '$_id',
                    title: '$jobDetails.title',
                    company: '$jobDetails.company',
                    applicationCount: '$count'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                usersByRole: usersByRoleObj,
                jobsByStatus: jobsByStatusObj,
                appsByStatus: appsByStatusObj,
                topJobs
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getAdminStats
};