const JobPost = require('../models/JobPost');
const User = require('../models/user.schema');
const Application = require('../models/Application');
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