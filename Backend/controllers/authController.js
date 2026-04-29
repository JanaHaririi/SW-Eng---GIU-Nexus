// controllers/authController.js
const User = require('../models/user.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Make sure you use the same bcrypt library as your schema

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check for existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Create user (Note: mapped 'name' from request to 'username' in schema)
        const user = await User.create({
            username: name, 
            email,
            password,
            role
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.username,
                email: user.email,
                role: user.role,
                status: user.recruiterStatus
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.username,
                email: user.email,
                role: user.role,
                status: user.recruiterStatus,
                profilePicture: user.profilePicture || "",
                skills: user.extractedSkills || []
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Log user out / clear token stateless
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};