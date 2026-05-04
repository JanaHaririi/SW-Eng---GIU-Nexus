const User = require('../models/user.schema');
const JobPost = require('../models/JobPost');
const Application = require('../models/Application');

// GET admin dashboard statistics
exports.getAdminStats = async (req, res, next) => {

    try {

        const totalUsers = await User.countDocuments();

        const totalJobs = await JobPost.countDocuments();

        const totalApplications = await Application.countDocuments();

        const recruiters = await User.countDocuments({
            role: 'recruiter'
        });

        const students = await User.countDocuments({
            role: 'jobSeeker'
        });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalJobs,
                totalApplications,
                recruiters,
                students
            }
        });

    } catch (err) {
        next(err);
    }

};