const express = require('express');
const {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs
} = require('../controllers/jobController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getJobs);

// must be before /:id
router.get('/saved', protect, authorize('jobSeeker'), getSavedJobs);

router.get('/:id', getJobById);

router.post('/:id/save', protect, authorize('jobSeeker'), toggleSaveJob);

module.exports = router;