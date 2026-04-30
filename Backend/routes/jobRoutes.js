const express = require('express');
const {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs
} = require('../controllers/jobController');

// const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getJobs);

// TODO: add auth later
// router.get('/saved', protect, authorize('jobSeeker'), getSavedJobs);
router.get('/saved', getSavedJobs);

router.get('/:id', getJobById);

// TODO: add auth later
// router.post('/:id/save', protect, authorize('jobSeeker'), toggleSaveJob);
router.post('/:id/save', toggleSaveJob);

module.exports = router;