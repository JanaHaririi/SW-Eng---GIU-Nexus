const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
    email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture:{
    type: String,
  },

   bio :{
      type:string,
       default: ' ' ,
       maxlength: [2000, 'Bio cannot exceed 2000 characters']
   },

    extractedSkills: {
        type: [String],
        default: [],
        description: 'Auto-populated by Hugging Face AI from bio text'
    },

    // Role & Permissions
    role: {
        type: String,
        required: true,
        enum: ['jobSeeker', 'recruiter', 'admin'],
        default: 'jobSeeker'
    },

    recruiterStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        description: 'Only relevant for recruiter accounts'
    },

    // ===== Timestamps =====
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
})

{ timestamps: true };

//Password hashing logic
// Password hashing logic
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);  // ← Fix: genSalt (not gensalt)
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
