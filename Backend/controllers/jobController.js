const JobPost = require('../models/JobPost');
const User = require('../models/user.schema');
const Application = require('../models/application.schema');
const hf = require('../services/hfService');

// 1. GET all jobs (with search + filters)
exports.getJobs = async (req, res, next) => {

  try {

    const {
      keyword,
      location,
      type,
      status,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // keyword search
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (location) query.location = location;

    if (type) query.type = type;

    if (status) query.status = status;

    const jobs = await JobPost.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await JobPost.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      jobs
    });

  } catch (err) {
    next(err);
  }

};

// 2. GET single job
exports.getJobById = async (req, res, next) => {

  try {

    const job = await JobPost.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      job
    });

  } catch (err) {
    next(err);
  }

};

// 3. SAVE / UNSAVE job
exports.toggleSaveJob = async (req, res, next) => {

  try {

    const user = await User.findById(req.user._id);

    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot save a closed job'
      });
    }

    const alreadySaved = user.savedJobs.includes(job._id);

    if (alreadySaved) {

      user.savedJobs.pull(job._id);

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Job removed from saved',
        saved: false
      });

    } else {

      user.savedJobs.push(job._id);

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Job saved',
        saved: true
      });

    }

  } catch (err) {
    next(err);
  }

};

// 4. GET saved jobs
exports.getSavedJobs = async (req, res, next) => {

  try {

    const user = await User.findById(req.user._id)
      .populate('savedJobs');

    res.status(200).json({
      success: true,
      jobs: user.savedJobs
    });

  } catch (err) {
    next(err);
  }

};

// 5. APPLY to a job
exports.applyToJob = async (req, res, next) => {

  try {

    const job = await JobPost.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is closed'
      });
    }

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({
      user: req.user._id,
      job: job._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already applied to this job'
      });
    }

    const application = await Application.create({
      user: req.user._id,
      job: job._id,
      coverLetter: req.body.coverLetter || ''
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });

  } catch (err) {
    next(err);
  }

};

// 6. GET recommended jobs
exports.getRecommendedJobs = async (req, res, next) => {

  try {

    const user = await User.findById(req.user._id);

    const jobs = await JobPost.find({
      status: 'open'
    });

    // Simple AI-style matching
    const recommendedJobs = jobs.filter(job => {

      const combinedText =
        `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();

      return user.extractedSkills.some(skill =>
        combinedText.includes(skill.toLowerCase())
      );

    });

    res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      jobs: recommendedJobs
    });

  } catch (err) {
    next(err);
  }

};
// 5. CREATE job
exports.createJob = async (req, res, next) => {
  try {
    // recruiter approval check
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message:
          'Your account is pending approval. Wait for admin approval before posting jobs.'
      });
    }

    const {
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots
    } = req.body;

    let category = 'Other';

    // AI classification
    try {
      const result = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: [description],
        parameters: {
          candidate_labels: [
            'Frontend',
            'Backend',
            'AI/ML',
            'DevOps',
            'Data Engineering',
            'Other'
          ]
        }
      });

      category = result[0].labels[0];
    } catch (error) {
      console.log('AI classification failed:', error.message);
    }

    const job = await JobPost.create({
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots,
      category,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      job
    });
  } catch (err) {
    next(err);
  }
};

// 6. GET recruiter jobs
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await JobPost.find({
      createdBy: req.user._id
    });

    res.status(200).json({
      success: true,
      jobs
    });
  } catch (err) {
    next(err);
  }
};

// 7. UPDATE job
exports.updateJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // ownership check
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to edit this job'
      });
    }

    // recruiter approval check
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval'
      });
    }

    // reclassify if description updated
    if (req.body.description) {
      try {
        const result = await hf.zeroShotClassification({
          model: 'facebook/bart-large-mnli',
          inputs: [req.body.description],
          parameters: {
            candidate_labels: [
              'Frontend',
              'Backend',
              'AI/ML',
              'DevOps',
              'Data Engineering',
              'Other'
            ]
          }
        });

        req.body.category = result[0].labels[0];
      } catch (error) {
        req.body.category = 'Other';
      }
    }

    const updatedJob = await JobPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      job: updatedJob
    });
  } catch (err) {
    next(err);
  }
};

// 8. DELETE job
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // owner/admin check
    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to delete this job'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted'
    });
  } catch (err) {
    next(err);
  }
};