// routes/vapihook.js
const express = require('express');
const router  = express.Router();
const Lead    = require('../models/Lead');

// ── POST /api/webhook/call-ended ───────────────────────────────────────────
// Called by Vapi at the end of every AI call
router.post('/call-ended', async (req, res) => {

  // Always return 200 immediately — Vapi will retry if it doesn't get it
  res.status(200).json({ received: true });

  try {
    const { message } = req.body;

    if (!message || message.type !== 'end-of-call-report') {
      return; // Ignore non-end-of-call events
    }

    const phone       = message.customer?.number;
    const transcript  = message.transcript    || '';
    const summary     = message.summary       || '';
    const recording   = message.recordingUrl  || '';
    const duration    = message.durationSeconds || 0;
    const callId      = message.call?.id;
    const endReason   = message.endedReason   || '';

    if (!phone) {
      console.log('⚠️  Vapi webhook: no phone number in payload');
      return;
    }

    console.log(`\n📞 Call ended: ${phone} | ${duration}s | Reason: ${endReason}`);
    if (summary) console.log(`Summary: ${summary.slice(0, 120)}...`);

    // ── Intent detection ───────────────────────────────────────────────────
    const combined = (summary + ' ' + transcript).toLowerCase();

    const hotSignals = [
      'interested', 'campus visit', 'visit', 'apply', 'want to join',
      'admission lena', 'aana chahta', 'aana chahti', 'join karna hai',
      'confirm karna', 'fees bharna', 'documents'
    ];
    const warmSignals = [
      'fees', 'placement', 'branch', 'scholarship', 'hostel',
      'rank', 'cutoff', 'package', 'course', 'kitna', 'batao',
      'tell me more', 'more information', 'details chahiye'
    ];

    let intent = 'cold';
    let status = 'not_interested';

    if (hotSignals.some(sig => combined.includes(sig))) {
      intent = 'hot';
      status = 'qualified';
    } else if (warmSignals.some(sig => combined.includes(sig))) {
      intent = 'warm';
      status = 'qualified';
    } else if (duration < 8) {
      // Call too short — student didn't engage
      intent = 'unknown';
      status = 'no_answer';
    }

    // ── Build call attempt record ──────────────────────────────────────────
    const attempt = {
      vapiCallId:   callId,
      calledAt:     new Date(),
      duration,
      endReason,
      transcript,
      recordingUrl: recording,
      summary
    };

    // ── Update lead in MongoDB ─────────────────────────────────────────────
    const updated = await Lead.findOneAndUpdate(
      { phone },
      {
        $set: {
          status,
          intent,
          lastCalledAt:       new Date(),
          latestTranscript:   transcript,
          latestSummary:      summary,
          latestRecordingUrl: recording
        },
        $push: { callAttempts: attempt },
        $inc:  { attempts: 1 }
      },
      { new: true }
    );

    if (updated) {
      console.log(`✅ Lead updated: ${phone} → ${status} (${intent})`);
    } else {
      // Lead not found — create a new one as fallback
      console.log(`⚠️  Lead not found for ${phone} — creating new record`);
      await Lead.create({
        phone,
        name:               message.customer?.name || 'Unknown',
        status,
        intent,
        lastCalledAt:       new Date(),
        latestTranscript:   transcript,
        latestSummary:      summary,
        latestRecordingUrl: recording,
        attempts:           1,
        callAttempts:       [attempt],
        college:            process.env.DEFAULT_COLLEGE_ID
      });
    }

  } catch (err) {
    // Do NOT re-throw — we already sent 200 to Vapi
    console.error('❌ Vapi webhook processing error:', err.message);
  }
});

module.exports = router;