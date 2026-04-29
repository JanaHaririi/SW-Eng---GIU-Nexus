// routes/authRoutes.js
const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout); // Logout requires a valid token

module.exports = router;