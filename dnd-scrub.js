require('dotenv').config();
const fetch = require('node-fetch');

async function scrubDND(leads) {
  console.log(`\nChecking ${leads.length} numbers against DND...`);

  // Exotel DND check — works once Exotel is live
  // For Twilio testing, we simulate — no numbers blocked
  // Replace this block with real Exotel API call after KYC

  const dndNumbers = new Set();

  /*
  // ── UNCOMMENT WHEN EXOTEL IS READY ──────────────────────────
  const SID   = process.env.EXOTEL_SID;
  const KEY   = process.env.EXOTEL_KEY;
  const TOKEN = process.env.EXOTEL_TOKEN;
  const creds = Buffer.from(`${KEY}:${TOKEN}`).toString('base64');

  for (const lead of leads) {
    const res  = await fetch(
      `https://api.exotel.com/v1/Accounts/${SID}/DNC/check.json?phone_number=${lead.phone}`,
      { headers: { Authorization: `Basic ${creds}` } }
    );
    const data = await res.json();
    if (data?.DNC?.is_dnd === true) {
      dndNumbers.add(lead.phone);
      console.log(`  ❌ DND: ${lead.phone}`);
    } else {
      console.log(`  ✅ Clear: ${lead.phone}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  // ────────────────────────────────────────────────────────────
  */

  // Twilio testing mode — all numbers clear
  leads.forEach(l => console.log(`  ✅ Clear (test mode): ${l.phone}`));

  return dndNumbers;
}

module.exports = { scrubDND };