// controllers/authController.js

const User = require('../models/user.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../services/emailService');
const { revoke } = require('../utils/tokenBlacklist');

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role, jti: uuidv4() }, process.env.JWT_SECRET, {
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

        // Recruiters require admin approval; everyone else is approved on signup.
        const recruiterStatus = role === 'recruiter' ? 'pending' : 'approved';

        // Create user
        const user = await User.create({
            username: name,
            email,
            password,
            role,
            recruiterStatus
        });

        if (user.role === 'recruiter') {
            return res.status(201).json({
                success: true,
                message: 'Your recruiter account is pending admin approval.'
            });
        }

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

        // Only recruiter accounts are subject to the admin-approval gate.
        // Admins and job seekers log in regardless of their recruiterStatus.
        if (user.role === 'recruiter' && user.recruiterStatus !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Account pending admin approval.'
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

    revoke(req.user.jti);

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });

};

// @desc    Forgot password — emails a reset link to the user
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {

    try {

        const user = await User.findOne({ email: req.body.email });

        // Only do the work if the user exists, but always respond with the
        // same generic message so the endpoint can't be used to enumerate
        // registered emails.
        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

            await user.save();

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

            const text =
                'You requested a password reset.\n\n' +
                `Click the link below to set a new password:\n${resetUrl}\n\n` +
                'This link expires in 10 minutes. ' +
                'If you did not request this, ignore this email.';

            const html =
                `<p>You requested a password reset.</p>` +
                `<p>Click the link below to set a new password:</p>` +
                `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
                `<p>This link expires in 10 minutes. ` +
                `If you did not request this, ignore this email.</p>`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'GIU Nexus — Password Reset Link',
                    text,
                    html
                });
            } catch (mailErr) {
                // Log but don't leak status — keep response generic.
                console.error('Password reset email failed:', mailErr);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });

    } catch (err) {
        next(err);
    }

};

// @desc    Reset password using the token from the email link
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {

    try {

        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(200).json({
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