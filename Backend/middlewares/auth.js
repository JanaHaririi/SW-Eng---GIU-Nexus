// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized to access this route' 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Look up the user — token may be valid but user could have been deleted
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized — user no longer exists' 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized to access this route' 
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Defensive check — should never hit this if `protect` ran first,
        // but prevents 500 crashes if `authorize` is ever used without `protect`
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized to access this route' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user.role}' is not authorized to access this route` 
            });
        }

        next();
    };
};