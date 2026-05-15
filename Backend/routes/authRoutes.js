// routes/authRoutes.js

const express = require('express');

const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registration, login, logout, and password recovery
 */

// Auth Routes

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: "Jana Hariri" }
 *               email:    { type: string, format: email, example: "jana@student.giu-uni.de" }
 *               password: { type: string, format: password, example: "S3cure!Pass" }
 *               role:     { type: string, enum: [jobSeeker, recruiter, admin], example: jobSeeker }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *               user: { _id: "66312abf0b0a3d0012ef00aa", name: "Jana Hariri", email: "jana@student.giu-uni.de", role: "jobSeeker", status: "pending" }
 *       400:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             example: { success: false, message: "Email already in use" }
 *       429: { description: Too many requests }
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: "jana@student.giu-uni.de" }
 *               password: { type: string, format: password, example: "S3cure!Pass" }
 *     responses:
 *       200:
 *         description: Authenticated; JWT returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *               user: { _id: "66312abf0b0a3d0012ef00aa", name: "Jana Hariri", email: "jana@student.giu-uni.de", role: "jobSeeker", status: "approved", profilePicture: "", skills: ["javascript", "react"] }
 *       400: { description: Missing email or password }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example: { success: false, message: "Invalid email or password" }
 *       429: { description: Too many requests }
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out the current user
 *     description: Revokes the current JWT by adding its jti to the in-memory blacklist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             example: { success: true, message: "Logged out successfully" }
 *       401:
 *         description: Not authorized or token revoked
 *         content:
 *           application/json:
 *             example: { success: false, message: "Token revoked" }
 */
router.post('/logout', protect, logout);

// Password Recovery Routes

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password-reset link
 *     description: Generates a reset token, stores its hash on the user with a 10-minute expiry, and emails a clickable reset link. Always returns the same generic response to prevent email enumeration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "jana@student.giu-uni.de" }
 *     responses:
 *       200:
 *         description: Generic success — sent whether or not the email exists
 *         content:
 *           application/json:
 *             example: { success: true, message: "Password reset email sent" }
 *       429: { description: Too many requests }
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   patch:
 *     tags: [Auth]
 *     summary: Reset password using the token from the forgot-password email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Raw reset token from the link emailed by /auth/forgot-password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password, example: "N3wPass!word" }
 *     responses:
 *       200:
 *         description: Password updated; new JWT issued
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *               user: { _id: "66312abf0b0a3d0012ef00aa", name: "Jana Hariri", email: "jana@student.giu-uni.de", role: "jobSeeker", status: "approved" }
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example: { success: false, message: "Token is invalid or has expired" }
 */
router.patch('/reset-password/:token', resetPassword);

module.exports = router;