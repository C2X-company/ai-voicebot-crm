// server/models/Lead.js
const mongoose = require('mongoose');

const callAttemptSchema = new mongoose.Schema({
  vapiCallId:   String,
  calledAt:     { type: Date, default: Date.now },
  duration:     { type: Number, default: 0 },   // seconds
  endReason:    String,
  transcript:   String,
  recordingUrl: String,
  summary:      String
}, { _id: false });

const leadSchema = new mongoose.Schema({

  // ── Student info ──────────────────────────────────────
  name: {
    type:     String,
    required: true,
    trim:     true
  },
  phone: {
    type:     String,
    required: true,
    trim:     true
  },
  email:          String,
  city:           String,
  jeeRank:        Number,
  branchInterest: String,
  
  // ADDED THIS: Needed for Campaign relation
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },

  // ── Ownership ─────────────────────────────────────────
  college: {
    type:     String, // 🚨 CHANGED: Now accepts Clerk 'org_...' string
    required: true
  },
  uploadedBy: {
    type: String // 🚨 CHANGED: Accepts Clerk user ID
  },

  // ── Call status ───────────────────────────────────────
  status: {
    type:    String,
    enum:    [
      'pending', 'calling', 'no_answer', 'not_interested', 
      'qualified', 'transferred', 'enrolled', 'dnd', 'New', 'Called'
    ],
    default: 'pending'
  },
  intent: {
    type:    String,
    enum:    ['hot', 'warm', 'cold', 'unknown'],
    default: 'unknown'
  },

  attempts:          { type: Number, default: 0 },
  lastCalledAt:      Date,
  transferRequested: { type: Boolean, default: false },
  transferReason:    String,

  callAttempts: [callAttemptSchema],
  latestTranscript:   String,
  latestSummary:      String,
  latestRecordingUrl: String,
  agentNotes: String,
  
  assignedTo: {
    type: String
  }

}, { timestamps: true });

// 🚨 CRITICAL: Compound index ensures phone is only unique WITHIN a specific college
leadSchema.index({ phone: 1, college: 1 }, { unique: true });
leadSchema.index({ college: 1, status: 1 });
leadSchema.index({ college: 1, intent: 1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', leadSchema);