// server/models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: true
  },
  college: {
    type:     String, // 🚨 CHANGED: Now accepts Clerk 'org_...' string
    required: true
  },
  createdBy: {
    type: String, // 🚨 CHANGED: Accepts Clerk 'user_...' string
  },
  status: {
    type:    String,
    enum:    ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },

  // Calling config
  callWindowStart: { type: Number, default: 9  },  // 9 AM
  callWindowEnd:   { type: Number, default: 21 },  // 9 PM
  maxDailyDialed:  { type: Number, default: 100 },
  maxAttempts:     { type: Number, default: 3 },
  retryGapHours:   { type: Number, default: 4 },

  // Stats
  totalLeads:      { type: Number, default: 0 },
  called:          { type: Number, default: 0 },
  qualified:       { type: Number, default: 0 },
  notInterested:   { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);