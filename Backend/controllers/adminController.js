const User = require('../models/user.schema');
const JobPost = require('../models/JobPost');
const Application = require('../models/application.schema');

// "YYYY-WW" matching MongoDB's `%G-%V` — ISO year + ISO week, so the year
// is consistent with the week (e.g. 2025-12-30 is "2026-01", not "2025-01").
const weekKey = (d) => {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = date.getUTCDay() || 7; // ISO: Sunday = 7
    date.setUTCDate(date.getUTCDate() + 4 - dayNum); // Thursday of this ISO week
    const isoYear = date.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${String(isoYear).padStart(4, '0')}-${String(week).padStart(2, '0')}`;
};

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

        // Applications grouped by ISO week, last 28 days.
        // Schema uses `appliedAt` as the application timestamp.
        const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

        const weekly = await Application.aggregate([
            { $match: { appliedAt: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%G-%V', date: '$appliedAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const counts = new Map(weekly.map((row) => [row._id, row.count]));

        const now = new Date();
        const applicationsPerWeek = [];
        for (let i = 3; i >= 0; i--) {
            const anchor = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() - i * 7
            ));
            const week = weekKey(anchor);
            applicationsPerWeek.push({ week, count: counts.get(week) || 0 });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalJobs,
                totalApplications,
                recruiters,
                students,
                applicationsPerWeek
            }
        });

    } catch (err) {
        next(err);
    }

};