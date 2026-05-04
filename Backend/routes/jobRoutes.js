const express = require('express');
const router = express.Router();

const {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  updateJob
} = require('../controllers/jobController');

const { protect, authorize } = require('../middlewares/auth');

router.get('/', getJobs);

// must be before /:id
router.get('/saved', protect, authorize('jobSeeker'), getSavedJobs);

router.get('/:id', getJobById);

router.patch('/:id', protect, authorize('recruiter'), updateJob);

router.post('/:id/save', protect, authorize('jobSeeker'), toggleSaveJob);

module.exports = router;