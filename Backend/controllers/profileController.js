const bcrypt = require('bcryptjs');
const User = require('../models/user.schema');
const hf = require('../services/hfService');

// GET /api/v1/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'profilePicture'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/profile/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/profile/extract-skills
const extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.bio || user.bio.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Bio is empty. Update your profile first.',
      });
    }

    try {
      const result = await hf.tokenClassification({
        model: 'dslim/bert-base-NER',
        inputs: user.bio,
      });

      const extractedSkills = cleanExtractedSkills(result);

      user.skills = extractedSkills;
      await user.save();

      return res.status(200).json({
        success: true,
        skills: user.skills,
        extracted: extractedSkills,
      });
    } catch (hfError) {
      console.error('Hugging Face skill extraction error:', hfError.message);

      return res.status(200).json({
        success: true,
        message: 'AI skill extraction failed. Existing skills returned unchanged.',
        skills: user.skills || [],
        extracted: [],
      });
    }
  } catch (error) {
    next(error);
  }
};

function cleanExtractedSkills(nerResult) {
  if (!Array.isArray(nerResult)) {
    return [];
  }

  const allowedTags = ['B-MISC', 'I-MISC', 'B-ORG', 'I-ORG', 'MISC', 'ORG'];

  const skills = nerResult
    .filter((item) => {
      const tag = item.entity_group || item.entity;
      return allowedTags.includes(tag);
    })
    .map((item) => item.word || '')
    .map((word) => word.replace(/^##/, ''))
    .map((word) => word.trim())
    .filter((word) => word.length > 1);

  const cleaned = [];

  for (const skill of skills) {
    const normalized = skill.replace(/[^\w#+.-]/g, '').trim();

    if (normalized && !cleaned.includes(normalized)) {
      cleaned.push(normalized);
    }
  }

  return cleaned;
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills,
};