// controllers/authController.js

const User = require('../models/user.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../services/emailService');

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
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }

        // Create user
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
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
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

// @desc    Log user out
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });

};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {

    try {

        const user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and save
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Token expires in 10 mins
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Reset URL
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const message = `
You requested a password reset.

Please make a PATCH request to:

${resetUrl}

If you did not request this email, please ignore it.
`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message
        });

        res.status(200).json({
            success: true,
            message: 'Reset email sent successfully'
        });

    } catch (err) {
        next(err);
    }

};

// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {

    try {

        // Hash incoming token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Set new password
        user.password = req.body.password;

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (err) {
        next(err);
    }

};