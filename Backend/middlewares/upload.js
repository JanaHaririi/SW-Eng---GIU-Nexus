// middlewares/upload.js

const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(null, true);
    }
    const err = new Error('Only JPEG, PNG, and WebP images are allowed');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

// Wraps upload.single() so multer's MulterError / our INVALID_FILE_TYPE
// surface as clean 400s instead of a generic 500 from the error handler.
const uploadSingle = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (!err) return next();

        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }

        if (err.code === 'INVALID_FILE_TYPE') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
        });
    });
};

module.exports = upload;
module.exports.uploadSingle = uploadSingle;
