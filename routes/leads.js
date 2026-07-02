// routes/leads.js
const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const Lead           = require('../models/Lead');
const Campaign       = require('../models/Campaign');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// ── GET /api/leads ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      status,
      intent,
      page  = 1,
      limit = 20,
      collegeId
    } = req.query;

    const query = {};
    if (status)    query.status  = status;
    if (intent)    query.intent  = intent;
    if (collegeId) query.college = collegeId;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('college',    'name slug')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      leads,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });

  } catch (err) {
    console.error('Get leads error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/leads/stats ───────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { collegeId } = req.query;
    const match = collegeId ? { college: require('mongoose').Types.ObjectId(collegeId) } : {};

    const statusStats = await Lead.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const intentStats = await Lead.aggregate([
      { $match: match },
      { $group: { _id: '$intent', count: { $sum: 1 } } }
    ]);

    const byStatus = {};
    statusStats.forEach(s => { byStatus[s._id] = s.count; });

    const byIntent = {};
    intentStats.forEach(s => { byIntent[s._id] = s.count; });

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    res.json({ byStatus, byIntent, total });

  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/leads/:id/status ──────────────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status, agentNotes } = req.body;

    const allowed = ['enrolled', 'not_interested', 'qualified', 'pending'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    const update = { status };
    if (agentNotes) update.agentNotes = agentNotes;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    res.json({ message: 'Lead updated', lead });

  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/leads/upload ─────────────────────────────────────────────────
// Accepts multipart/form-data with: file (CSV), campaignId, collegeId
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { campaignId, collegeId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }
    if (!collegeId) {
      return res.status(400).json({ message: 'collegeId is required' });
    }

    // Parse CSV from buffer
    const csvText = req.file.buffer.toString('utf8');
    const lines   = csvText.trim().split('\n');

    if (lines.length < 2) {
      return res.status(400).json({ message: 'CSV file is empty or has no data rows' });
    }

    // Parse headers — normalise to lowercase, trim whitespace
    const headers = lines[0]
      .split(',')
      .map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));

    // Validate required columns
    const requiredCols = ['name', 'phone'];
    const missingCols  = requiredCols.filter(col => !headers.includes(col));
    if (missingCols.length > 0) {
      return res.status(400).json({
        message: `CSV is missing required columns: ${missingCols.join(', ')}`
      });
    }

    let imported = 0;
    let skipped  = 0;
    let invalid  = 0;
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle commas inside quoted fields
      const values = line.match(/(".*?"|[^,]+)/g)?.map(v =>
        v.replace(/^"|"$/g, '').trim()
      ) || line.split(',').map(v => v.trim());

      const row = {};
      headers.forEach((h, j) => { row[h] = values[j] || ''; });

      // Skip rows with no phone or name
      if (!row.phone || !row.name) {
        invalid++;
        continue;
      }

      // Normalise phone — ensure +91 prefix
      let phone = row.phone.replace(/\s/g, '');
      if (phone.startsWith('0')) phone = '+91' + phone.slice(1);
      if (!phone.startsWith('+')) phone = '+91' + phone;

      try {
        const result = await Lead.findOneAndUpdate(
          { phone, college: collegeId },
          {
            $setOnInsert: {
              name:           row.name,
              phone,
              email:          row.email          || undefined,
              city:           row.city           || undefined,
              jeeRank:        row.jee_rank || row.jeerank
                                ? Number(row.jee_rank || row.jeerank)
                                : undefined,
              branchInterest: row.branch_interest || row.branch || undefined,
              college:        collegeId,
              status:         'pending',
              intent:         'unknown',
              attempts:       0
            }
          },
          { upsert: true, new: false } // new: false returns null if inserted
        );

        if (result === null) imported++; // null means it was newly inserted
        else skipped++;                  // document existed — duplicate

      } catch (err) {
        if (err.code === 11000) {
          skipped++;
        } else {
          errors.push(`Row ${i + 1} (${row.name}): ${err.message}`);
          invalid++;
        }
      }
    }

    // Update campaign lead count if campaignId provided
    if (campaignId && imported > 0) {
      await Campaign.findByIdAndUpdate(
        campaignId,
        { $inc: { totalLeads: imported } }
      );
    }

    console.log(`📁 CSV Upload: ${imported} imported, ${skipped} skipped, ${invalid} invalid`);

    res.json({
      message:  'Upload complete',
      imported,
      skipped,
      invalid,
      errors:   errors.slice(0, 10) // return max 10 errors
    });

  } catch (err) {
    console.error('CSV upload error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;