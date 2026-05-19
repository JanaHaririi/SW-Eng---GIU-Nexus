const User = require('../models/user.schema');
const JobPost = require('../models/JobPost');
const Application = require('../models/application.schema');

// GET admin dashboard statistics
exports.getAdminStats = async (req, res, next) => {

    try {

        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const jobsByStatus = await JobPost.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const appsByStatus = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

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
                usersByRole,
                jobsByStatus,
                appsByStatus,
                topJobs
            }
        });

    } catch (err) {
        next(err);
    }

};