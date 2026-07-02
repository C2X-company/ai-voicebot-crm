// server/controllers/leadController.js
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');

// ── GET LEADS (role-aware) ─────────────────────────────────────────────────
exports.getLeads = async (req, res) => {
  try {
    const { status, intent, page = 1, limit = 20 } = req.query;
    const query = {};

    // Agents only see qualified/transferred leads
    if (req.user.role === 'agent') {
      query.college = req.user.college._id;
      query.status  = { $in: ['qualified', 'transferred', 'enrolled'] };
    }
    // College admin sees all leads for their college
    else if (req.user.role === 'college_admin') {
      query.college = req.user.college._id;
    }
    // Superadmin sees everything (no college filter)

    if (status) query.status = status;
    if (intent) query.intent = intent;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('college',    'name slug')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      leads,
      pagination: {
        total,
        page:       Number(page),
        pages:      Math.ceil(total / limit),
        limit:      Number(limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
};

// ── UPDATE LEAD STATUS (agent action) ─────────────────────────────────────
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id }              = req.params;
    const { status, agentNotes } = req.body;

    const allowed = ['enrolled', 'not_interested', 'qualified'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status for this action' });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Agent can only update leads in their college
    if (req.user.role === 'agent' &&
        lead.college.toString() !== req.user.college._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    lead.status     = status;
    lead.assignedTo = req.user._id;
    if (agentNotes) lead.agentNotes = agentNotes;
    await lead.save();

    res.json({ message: 'Lead updated', lead });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating lead' });
  }
};

// ── GET LEAD STATS ─────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const match = {};
    if (req.user.role !== 'superadmin') {
      match.college = req.user.college._id;
    }

    const stats = await Lead.aggregate([
      { $match: match },
      { $group: {
        _id:    '$status',
        count:  { $sum: 1 }
      }},
    ]);

    const intentStats = await Lead.aggregate([
      { $match: match },
      { $group: {
        _id:   '$intent',
        count: { $sum: 1 }
      }}
    ]);

    const formatted = {};
    stats.forEach(s => formatted[s._id] = s.count);

    const intentFormatted = {};
    intentStats.forEach(s => intentFormatted[s._id] = s.count);

    res.json({
      byStatus: formatted,
      byIntent: intentFormatted,
      total:    Object.values(formatted).reduce((a, b) => a + b, 0)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating stats' });
  }
};

// ── UPLOAD CSV LEADS ───────────────────────────────────────────────────────
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const { campaignId } = req.body;
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      // Clean up the uploaded file if campaign doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const results = [];
    
    // Parse the CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Map the CSV columns to your Lead schema
        results.push({
          name: data.Name || data.name,
          phone: data.Phone || data.phone,
          city: data.City || data.city,
          jee_rank: data.JEE_Rank || data.jee_rank || data.jeeRank,
          college: req.user.college._id, // Assign to the admin's college
          campaign: campaignId,
          status: 'pending' // Default status for new leads
        });
      })
      .on('end', async () => {
        try {
          // Insert all leads into the database at once
          const savedLeads = await Lead.insertMany(results);
          
          // Update campaign stats
          campaign.totalLeads += savedLeads.length;
          await campaign.save();

          // Delete the temporary CSV file from the server
          fs.unlinkSync(req.file.path);

          res.status(201).json({ 
            message: `Successfully imported ${savedLeads.length} leads`,
            campaignTotal: campaign.totalLeads
          });
        } catch (dbError) {
          console.error('Database Error during CSV insert:', dbError);
          fs.unlinkSync(req.file.path); // Ensure file is deleted even if DB fails
          res.status(500).json({ message: 'Error saving leads to database' });
        }
      });

  } catch (err) {
    console.error('CSV Upload Error:', err);
    // Attempt to clean up file if an outer error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); 
    }
    res.status(500).json({ message: 'Error processing CSV file' });
  }
};