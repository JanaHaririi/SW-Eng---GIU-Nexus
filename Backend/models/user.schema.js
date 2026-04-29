const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
    email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true 
  },
  password: {
    type: String,
    required: true
  },
  profilePicture:{
    type: String,
  },

   bio :{
      type: String,
       default: '' ,
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
   }, { timestamps: true });

// Password hashing logic
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    // No try/catch or next() needed, Mongoose handles errors automatically in async hooks
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);