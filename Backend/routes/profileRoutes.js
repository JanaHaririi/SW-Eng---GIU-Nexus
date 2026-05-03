const express = require('express');

const {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills,
} = require('../controllers/profileController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, getProfile);

router.patch('/', protect, updateProfile);

router.patch('/change-password', protect, changePassword);

router.post('/extract-skills', protect, authorize('jobSeeker'), extractSkills);

module.exports = router;