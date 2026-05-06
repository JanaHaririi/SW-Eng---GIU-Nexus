const express = require('express');

const {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills,
} = require('../controllers/profileController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Logged-in user's own profile
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user: { _id: "66312abf0b0a3d0012ef00aa", name: "Jana Hariri", email: "jana@student.giu-uni.de", role: "jobSeeker", bio: "CS student interested in backend systems.", extractedSkills: ["javascript", "node.js"] }
 *       401: { description: Not authorized }
 */
router.get('/', protect, getProfile);

/**
 * @swagger
 * /profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:           { type: string, example: "Jana H." }
 *               bio:            { type: string, example: "Backend engineer in training." }
 *               profilePicture: { type: string, example: "https://cdn.example.com/u/jana.png" }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             example: { success: true, message: "Profile updated" }
 *       401: { description: Not authorized }
 */
router.patch('/', protect, updateProfile);

/**
 * @swagger
 * /profile/change-password:
 *   patch:
 *     tags: [Profile]
 *     summary: Change the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password, example: "OldPass!1" }
 *               newPassword:     { type: string, format: password, example: "NewPass!2" }
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             example: { success: true, message: "Password changed successfully" }
 *       400: { description: Validation error or wrong current password }
 *       401: { description: Not authorized }
 */
router.patch('/change-password', protect, changePassword);

/**
 * @swagger
 * /profile/extract-skills:
 *   post:
 *     tags: [Profile]
 *     summary: Extract skills from the user's bio using AI (jobSeeker only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skills extracted and saved on the user
 *         content:
 *           application/json:
 *             example: { success: true, extractedSkills: ["javascript", "react", "node.js", "mongodb"] }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers may extract skills }
 */
router.post('/extract-skills', protect, authorize('jobSeeker'), extractSkills);

module.exports = router;
