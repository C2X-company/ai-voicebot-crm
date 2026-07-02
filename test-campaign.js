const fetch = require('node-fetch');

async function testCampaignFlow() {
  try {
    // Step 1: Get the VIP Pass (Login)
    console.log('1️⃣ Logging in as College Admin...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@iiit.ac.in',     // From your seed.js!
        password: 'College@123'        // From your seed.js!
      })
    });

    const loginData = await loginRes.json();

    if (!loginData.token) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    console.log('✅ Login successful! Token acquired.');
    const token = loginData.token;

    // Step 2: Use the Token to create a Campaign
    console.log('\n2️⃣ Bypassing the Bouncer to create a Campaign...');
    const campaignRes = await fetch('http://localhost:3001/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 👈 Handing the token to your Bouncer
      },
      body: JSON.stringify({
        name: 'BTech Admissions 2026 - Phase 1',
        collegeId: '6a195cbb1d8397c80049e3b1', // 👈 The exact ID you fetched earlier!
        maxDailyDialed: 150
      })
    });

    const campaignData = await campaignRes.json();
    console.log('\n🎯 Campaign Creation Result:');
    console.log(campaignData);

  } catch (err) {
    console.error('Test Failed:', err);
  }
}

testCampaignFlow();