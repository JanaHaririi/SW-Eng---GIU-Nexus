const express = require('express');

const router = express.Router();

const {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  applyToJob,
  getRecommendedJobs
} = require('../controllers/jobController');

const { protect, authorize } = require('../middlewares/auth');

// GET all jobs
router.get('/', getJobs);

// GET recommended jobs
router.get(
  '/recommended',
  protect,
  authorize('jobSeeker'),
  getRecommendedJobs
);

// GET saved jobs
router.get(
  '/saved',
  protect,
  authorize('jobSeeker'),
  getSavedJobs
);

// APPLY to a job
router.post(
  '/:jobId/apply',
  protect,
  authorize('jobSeeker'),
  applyToJob
);

// GET single job
router.get('/:id', getJobById);

// SAVE / UNSAVE job
router.post(
  '/:id/save',
  protect,
  authorize('jobSeeker'),
  toggleSaveJob
);

module.exports = router;