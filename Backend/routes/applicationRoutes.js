const express = require('express');
const {
  createApplication,
  getApplications,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getApplications)
  .post(authorize('jobSeeker'), createApplication);

router.get('/my', authorize('jobSeeker'), getMyApplications);

router.patch('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
