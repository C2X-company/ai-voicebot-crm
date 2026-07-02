// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkUserId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['superadmin', 'college_admin', 'agent'],
    default: 'agent' 
  },
  college: { 
    type: String // 🚨 CHANGED: ObjectId to String
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);