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

const router = express.Router();

// Auth Routes
router.post('/register', register);

router.post('/login', login);

router.post('/logout', protect, logout);

// Password Recovery Routes
router.post('/forgot-password', forgotPassword);

router.patch('/reset-password/:token', resetPassword);

module.exports = router;