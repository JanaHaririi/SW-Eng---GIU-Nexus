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
      .populate('createdBy', 'username')
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function hfInfer(
  modelId,
  body,
  label,
  { retries = 1, delayMs = 2000, timeoutMs = 8000 } = {}
) {
  if (!process.env.HF_TOKEN) throw new Error('HF_TOKEN env var is missing');

  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
  const payload = JSON.stringify({
    ...body,
    options: { wait_for_model: true, use_cache: true },
  });

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const t0 = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
          'x-wait-for-model': 'true',
        },
        body: payload,
        signal: controller.signal,
      });

      const ms = Date.now() - t0;
      const ct = response.headers.get('content-type') || '';
      console.log(`[HF:${label}] attempt ${attempt + 1}/${retries + 1} -> ${response.status} (${ms}ms, ${ct})`);

      if (response.ok) {
        return ct.includes('application/json') ? response.json() : response.text();
      }

      const errText = (await response.text()).slice(0, 800);
      console.warn(`[HF:${label}] non-OK body: ${errText}`);

      if ((response.status === 503 || response.status === 429) && attempt < retries) {
        await sleep(delayMs * (attempt + 1));
        continue;
      }
      throw new Error(`HF ${response.status}: ${errText}`);
    } catch (netErr) {
      lastErr = netErr;
      const reason = netErr.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : netErr.message;
      console.warn(`[HF:${label}] attempt ${attempt + 1} threw: ${reason}`);
      if (attempt < retries) {
        await sleep(delayMs * (attempt + 1));
        continue;
      }
      break;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobs = await JobPost.find({ status: 'open' });

    if (!jobs.length) {
      return res.status(200).json({ success: true, count: 0, jobs: [] });
    }

    const skills = (user.extractedSkills || []).filter(Boolean);
    if (skills.length === 0) {
      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs: jobs.map((j) => ({ ...j.toObject(), score: 0 })),
        note: 'No skills on profile yet. Run /profile/extract-skills first.'
      });
    }

    const studentText = skills.join(', ');
    const jobTexts = jobs.map((j) =>
      `${j.title}. ${(j.requirements || []).join(', ')}. ${j.description || ''}`.trim()
    );

    try {
      const scores = await hfInfer(
        'sentence-transformers/all-MiniLM-L6-v2',
        {
          inputs: {
            source_sentence: studentText,
            sentences: jobTexts,
          },
        },
        'sentenceSimilarity'
      );

      if (!Array.isArray(scores) || scores.length !== jobTexts.length) {
        throw new Error(`Unexpected score shape from HF (got ${scores?.length ?? 0}, expected ${jobTexts.length})`);
      }

      const MIN_SCORE = 0.35;
      const scored = jobs
        .map((job, i) => ({
          ...job.toObject(),
          score: Number(scores[i].toFixed(4)),
        }))
        .filter((j) => j.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score);

      return res.status(200).json({
        success: true,
        count: scored.length,
        jobs: scored,
      });
    } catch (hfErr) {
      // Spec: graceful failure — return all open jobs without scores.
      console.error('[HF:featureExtraction] giving up:', hfErr?.message || hfErr);
      return res.status(200).json({
        success: true,
        message: 'AI recommendations unavailable. Returning all open jobs without ranking.',
        count: jobs.length,
        jobs: jobs.map((j) => j.toObject()),
      });
    }
  } catch (err) {
    next(err);
  }
};

// BONUS: AI cover letter suggestion
// POST /api/v1/jobs/:id/cover-letter — job seeker only
exports.generateCoverLetter = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('username bio');
    const job = await JobPost.findById(req.params.id).select('title company description requirements');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (!user?.bio || user.bio.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Your bio is empty. Update your profile first so the AI has context to work with.',
      });
    }

    const companyName = job.company || 'the company';

    try {
      const t0 = Date.now();
      const completion = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional career advisor. Write concise, sincere cover letters of 180-250 words. Warm but professional tone. Start directly with "Dear Hiring Manager,". No placeholders like [Your Name] or [Company]. No markdown. No preamble.',
          },
          {
            role: 'user',
            content:
              `Write a cover letter for ${user.username} applying to "${job.title}" at ${companyName}.\n\n` +
              `Job description: ${job.description}\n` +
              `Job requirements: ${(job.requirements || []).join(', ')}\n\n` +
              `Candidate background: ${user.bio}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const text = completion?.choices?.[0]?.message?.content?.trim();
      console.log(`[HF:chatCompletion] ${Date.now() - t0}ms, ${text?.length || 0} chars`);

      if (!text) {
        throw new Error('Empty response from chat-completion model');
      }

      return res.status(200).json({ success: true, coverLetter: text });
    } catch (hfErr) {
      console.error('[HF:chatCompletion] giving up:', hfErr?.message || hfErr);
      return res.status(503).json({
        success: false,
        message: 'AI cover letter generation is unavailable right now. Please try again in a moment.',
      });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    next(err);
  }
};

// 5. CREATE job
exports.createJob = async (req, res, next) => {
  try {
    // recruiter approval check
    if (req.user.recruiterStatus !== 'approved') {
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
    })
      .populate('createdBy', 'username')
      .lean();

    const jobIds = jobs.map((j) => j._id);

    const counts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]);

    const countByJob = new Map(
      counts.map((c) => [c._id.toString(), c.count])
    );

    const jobsWithCount = jobs.map((j) => ({
      ...j,
      applicantCount: countByJob.get(j._id.toString()) || 0
    }));

    res.status(200).json({
      success: true,
      jobs: jobsWithCount
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
    if (req.user.recruiterStatus !== 'approved') {
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