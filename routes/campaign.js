// routes/campaign.js
const express  = require('express');
const router   = express.Router();
const Campaign = require('../models/Campaign');
const Lead     = require('../models/Lead');

// ── GET /api/campaigns ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { collegeId } = req.query;
    const query = collegeId ? { college: collegeId } : {};

    const campaigns = await Campaign.find(query)
      .populate('college', 'name slug')
      .sort({ createdAt: -1 });

    res.json(campaigns);

  } catch (err) {
    console.error('Get campaigns error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/campaigns/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('college', 'name slug');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);

  } catch (err) {
    console.error('Get campaign error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/campaigns ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      name,
      collegeId,
      maxDailyDialed  = 100,
      callWindowStart = 9,
      callWindowEnd   = 21,
      maxAttempts     = 3,
      retryGapHours   = 4
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Campaign name is required' });
    }
    if (!collegeId) {
      return res.status(400).json({ message: 'collegeId is required' });
    }

    const campaign = await Campaign.create({
      name,
      college:        collegeId,
      maxDailyDialed: Number(maxDailyDialed),
      callWindowStart: Number(callWindowStart),
      callWindowEnd:   Number(callWindowEnd),
      maxAttempts:     Number(maxAttempts),
      retryGapHours:   Number(retryGapHours),
      status:         'draft'
    });

    console.log(`✅ Campaign created: ${campaign.name} (${campaign._id})`);

    res.status(201).json(campaign);

  } catch (err) {
    console.error('Create campaign error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/campaigns/:id/status ───────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'active', 'paused', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    res.json({ message: 'Campaign updated', campaign });

  } catch (err) {
    console.error('Update campaign error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;