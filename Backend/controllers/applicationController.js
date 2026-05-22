const Application = require('../models/application.schema');
const JobPost = require('../models/JobPost');

const VALID_STATUSES = ['pending', 'shortlisted', 'accepted', 'rejected'];

const applicationPopulate = [
  {
    path: 'user',
    select: 'username email profilePicture bio extractedSkills'
  },
  {
    path: 'job',
    select: 'title company location type status createdBy'
  }
];

const buildPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const userOwnsJob = (job, userId) => {
  return job.createdBy && job.createdBy.toString() === userId.toString();
};

const canManageJob = (user, job) => {
  return user.role === 'admin' || (user.role === 'recruiter' && userOwnsJob(job, user._id));
};

const getRecruiterJobIds = async (userId) => {
  const jobs = await JobPost.find({ createdBy: userId }).select('_id');
  return jobs.map((job) => job._id);
};

// @desc    Submit an application for an open job
// @route   POST /api/v1/applications
// @access  Job seeker only
exports.createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter = '' } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'jobId is required'
      });
    }

    const job = await JobPost.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to a closed job'
      });
    }

    const application = await Application.create({
      user: req.user._id,
      job: job._id,
      coverLetter
    });

    await application.populate(applicationPopulate);

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    next(error);
  }
};

// @desc    Get applications visible to the current user
// @route   GET /api/v1/applications
// @access  Authenticated users
exports.getApplications = async (req, res, next) => {
  try {
    const { status, job, user } = req.query;
    const { page, limit, skip } = buildPagination(req.query);

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const filter = {};
    if (status) filter.status = status;
    if (job) filter.job = job;

    if (req.user.role === 'jobSeeker') {
      filter.user = req.user._id;
    } else if (req.user.role === 'recruiter') {
      const jobIds = await getRecruiterJobIds(req.user._id);

      if (job && !jobIds.some((jobId) => jobId.toString() === job.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view applications for this job'
        });
      }

      filter.job = job || { $in: jobIds };

      if (user) filter.user = user;
    } else if (user) {
      filter.user = user;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate(applicationPopulate)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      applications
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query id'
      });
    }

    next(error);
  }
};

// @desc    Get applications submitted by the current student
// @route   GET /api/v1/applications/my
// @access  Job seeker only
exports.getMyApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = buildPagination(req.query);

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          select: 'title company location type status createdBy'
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/v1/jobs/:jobId/applicants
// @access  Owning recruiter or admin
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = buildPagination(req.query);
    const job = await JobPost.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!canManageJob(req.user, job)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job'
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const filter = { job: job._id };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'user',
          select: 'username email profilePicture bio extractedSkills'
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      job,
      applicants: applications
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    next(error);
  }
};

// @desc    Update an application status
// @route   PATCH /api/v1/applications/:id/status
// @access  Owning recruiter or admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!canManageJob(req.user, application.job)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    await application.save();

    // Sync job's open/closed state to its accepted-count. We re-check on every
    // status change (not just accept) so that demoting an accepted applicant
    // back to pending/rejected re-opens a job that previously hit capacity.
    const acceptedCount = await Application.countDocuments({
      job: application.job._id,
      status: 'accepted'
    });

    const newJobStatus =
      acceptedCount >= application.job.totalSlots ? 'closed' : 'open';

    console.log(
      `[autoClose] job=${application.job._id} accepted=${acceptedCount} ` +
        `totalSlots=${application.job.totalSlots} ` +
        `currentStatus=${application.job.status} -> ${newJobStatus}`
    );

    if (application.job.status !== newJobStatus) {
      await JobPost.findByIdAndUpdate(application.job._id, { status: newJobStatus });
    }

    await application.populate(applicationPopulate);

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    next(error);
  }
};
