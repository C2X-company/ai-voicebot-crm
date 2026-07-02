const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const User = require('../models/User');

// POST /api/webhooks/clerk
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook secret is missing in .env' });
  }

  // Get the headers Svix needs to verify the request is actually from Clerk
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- no svix headers' });
  }

  const payload = req.body;
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    // Verify the webhook is authentic
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  // When a user is created in Clerk, create them in MongoDB
  if (eventType === 'user.created') {
    const email = evt.data.email_addresses[0].email_address;
    const firstName = evt.data.first_name || '';
    const lastName = evt.data.last_name || '';

    try {
      await User.create({
        clerkUserId: id,
        email: email,
        name: `${firstName} ${lastName}`.trim() || 'New User',
        // role and college will be added later by a superadmin manually or via dashboard
      });
      console.log(`✅ Synced new user to MongoDB: ${email}`);
    } catch (err) {
      console.error('Error saving user to DB:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  res.status(200).json({ success: true });
});

module.exports = router;