const bcrypt = require('bcryptjs');
const User = require('../models/user.schema');
const cloudinary = require('../config/cloudinary');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Direct HF Serverless Inference call. Bypasses the SDK so we see the real
// HTTP status + response body, and can pass wait_for_model so HF blocks until
// the model is warm instead of returning 503.
async function hfInfer(modelId, body, label, { retries = 3, delayMs = 4000 } = {}) {
  if (!process.env.HF_TOKEN) {
    throw new Error('HF_TOKEN env var is missing');
  }

  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
  const payload = JSON.stringify({
    ...body,
    options: { wait_for_model: true, use_cache: true },
  });

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const t0 = Date.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
          'x-wait-for-model': 'true',
        },
        body: payload,
      });

      const ms = Date.now() - t0;
      const ct = response.headers.get('content-type') || '';
      console.log(`[HF:${label}] attempt ${attempt + 1}/${retries + 1} -> ${response.status} (${ms}ms, ${ct})`);

      if (response.ok) {
        return ct.includes('application/json') ? response.json() : response.text();
      }

      const errText = (await response.text()).slice(0, 800);
      console.warn(`[HF:${label}] non-OK body: ${errText}`);

      // 503 = model loading; 429 = rate limit. Retry both.
      if ((response.status === 503 || response.status === 429) && attempt < retries) {
        await sleep(delayMs * (attempt + 1));
        continue;
      }
      throw new Error(`HF ${response.status}: ${errText}`);
    } catch (netErr) {
      lastErr = netErr;
      console.warn(`[HF:${label}] attempt ${attempt + 1} threw: ${netErr.message}`);
      if (attempt < retries) {
        await sleep(delayMs * (attempt + 1));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

function cleanExtractedSkills(nerResult) {
  if (!Array.isArray(nerResult)) return [];

  // With aggregation_strategy: "simple", HF returns merged entities like:
  //   { entity_group: "MISC", word: "French Cuisine", score: 0.97, ... }
  // We keep MISC and ORG groups (technologies, frameworks, organisations).
  const allowedGroups = ['MISC', 'ORG'];

  const seen = new Set();
  const cleaned = [];

  for (const item of nerResult) {
    const group = item.entity_group || item.entity;
    if (!allowedGroups.includes(group)) continue;

    const word = (item.word || '').replace(/\s+/g, ' ').trim();
    if (word.length < 2) continue;

    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(word);
  }

  return cleaned;
}

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

    // If a profilePicture file was uploaded, push it to Cloudinary,
    // delete the previous Cloudinary asset, and store the new secure_url.
    if (req.file) {
      const existing = await User.findById(req.user._id).select('profilePicturePublicId');

      if (existing?.profilePicturePublicId) {
        try {
          await cloudinary.uploader.destroy(existing.profilePicturePublicId);
        } catch (destroyErr) {
          // Don't fail the request if the old asset can't be deleted —
          // log and continue so the new upload still goes through.
          console.warn('[cloudinary] failed to delete previous image:', destroyErr.message);
        }
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'giu-nexus/profile-pictures', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      updates.profilePicture = uploadResult.secure_url;
      updates.profilePicturePublicId = uploadResult.public_id;
    }

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
      const rawNer = await hfInfer(
        'dslim/bert-base-NER',
        {
          inputs: user.bio,
          parameters: { aggregation_strategy: 'simple' },
        },
        'tokenClassification'
      );

      const extractedSkills = cleanExtractedSkills(rawNer);
      user.extractedSkills = extractedSkills;
      await user.save();

      return res.status(200).json({
        success: true,
        extractedSkills: user.extractedSkills,
      });
    } catch (hfError) {
      // Spec: graceful failure — log, return existing skills unchanged with 200.
      console.error('[HF:tokenClassification] giving up:', hfError?.message || hfError);
      return res.status(200).json({
        success: true,
        message: 'AI skill extraction failed. Existing skills returned unchanged.',
        extractedSkills: user.extractedSkills || [],
        extracted: [],
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills,
};