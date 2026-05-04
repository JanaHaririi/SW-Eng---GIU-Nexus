const express = require('express');

const router = express.Router();

const {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  applyToJob,
  getRecommendedJobs,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { getJobApplicants } = require('../controllers/applicationController');

const { protect, authorize } = require('../middlewares/auth');

// public routes
router.get('/', getJobs);

// must be before /:id
router.get(
  '/saved',
  protect,
  authorize('jobSeeker'),
  getSavedJobs
);

// recruiter routes
router.post(
  '/',
  protect,
  authorize('recruiter'),
  createJob
);

router.get(
  '/my-jobs',
  protect,
  authorize('recruiter'),
  getMyJobs
);

router.patch(
  '/:id',
  protect,
  authorize('recruiter'),
  updateJob
);

router.delete(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  deleteJob
);

router.get('/:jobId/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);

// GET single job
router.get('/:id', getJobById);

// save/unsave route
router.post(
  '/:id/save',
  protect,
  authorize('jobSeeker'),
  toggleSaveJob
);

module.exports = router;
