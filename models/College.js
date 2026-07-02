// server/models/College.js
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  orgId: {          // 🚨 ADDED THIS: To link directly to Clerk
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type:     String,
    required: true,
    trim:     true
  },
  slug: {
    type:     String,
    required: true,
    unique:   true,
    lowercase: true
  },
  pineconeNamespace: {
    type:    String,
    unique:  true
  },
  contactEmail: String,
  contactPhone: String,
  plan: {
    type:    String,
    enum:    ['starter', 'growth', 'enterprise'],
    default: 'starter'
  },
  minutesLimit: {
    type:    Number,
    default: 5000
  },
  minutesUsed: {
    type:    Number,
    default: 0
  },
  isActive: {
    type:    Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-generate pineconeNamespace from slug
collegeSchema.pre('save', function() {
  if (!this.pineconeNamespace) {
    this.pineconeNamespace = `college-${this.slug}`;
  }
});
module.exports = mongoose.models.College || mongoose.model('College', collegeSchema);