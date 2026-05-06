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

// Auth Routes
router.post('/register', authLimiter, register);

router.post('/login', authLimiter, login);

router.post('/logout', protect, logout);

// Password Recovery Routes
router.post('/forgot-password', authLimiter, forgotPassword);

router.post('/verify-otp', authLimiter, verifyOtp);

router.patch('/reset-password/:token', resetPassword);

module.exports = router;