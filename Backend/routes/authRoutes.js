// routes/authRoutes.js

const express = require('express');

const {
    register,
    login,
    logout,
    forgotPassword,
    verifyOtp,
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
 *     summary: Request a password-reset OTP
 *     description: Generates a 6-digit OTP, stores it on the user with a 10-minute expiry, and emails it.
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
 *         description: OTP emailed
 *         content:
 *           application/json:
 *             example: { success: true, message: "OTP sent to email successfully" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example: { success: false, message: "User not found" }
 *       429: { description: Too many requests }
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and receive a password-reset link/token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: "jana@student.giu-uni.de" }
 *               otp:   { type: string, example: "048273" }
 *     responses:
 *       200:
 *         description: OTP valid; reset token issued
 *         content:
 *           application/json:
 *             example: { success: true, message: "OTP verified successfully", resetUrl: "http://localhost:3000/reset-password/2c3a...", resetToken: "2c3a4f5b6d7e..." }
 *       400:
 *         description: Missing fields, expired OTP, or incorrect OTP
 *         content:
 *           application/json:
 *             example: { success: false, message: "Incorrect OTP" }
 *       429: { description: Too many requests }
 */
router.post('/verify-otp', authLimiter, verifyOtp);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   patch:
 *     tags: [Auth]
 *     summary: Reset password using the token from verify-otp
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Plain reset token returned by /auth/verify-otp
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
 *         description: Password updated
 *         content:
 *           application/json:
 *             example: { success: true, message: "Password reset successful" }
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example: { success: false, message: "Invalid or expired token" }
 */
router.patch('/reset-password/:token', resetPassword);

module.exports = router;