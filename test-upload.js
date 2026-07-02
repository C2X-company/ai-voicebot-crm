const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testCSVUpload() {
  try {
    // 1. Get the VIP Pass
    console.log('1️⃣ Logging in as College Admin...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@iiit.ac.in', // Your seeded admin
        password: 'College@123'
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    console.log('✅ Login successful! Token acquired.');

    // 2. Prepare the Form Data
    console.log('\n2️⃣ Preparing sample-leads.csv for upload...');
    const form = new FormData();
    
    // Attach the Campaign ID we generated earlier
    form.append('campaignId', '6a1964eae67a2c32a33de2f4'); 
    
    // Attach the actual physical file
    form.append('file', fs.createReadStream('./sample-leads.csv'));

    // 3. Send it to the Route
    console.log('\n3️⃣ Bypassing the Bouncer and uploading file...');
    const uploadRes = await fetch('http://localhost:3001/api/leads/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
        // 🚨 IMPORTANT: Do NOT set 'Content-Type' here! 
        // The form-data library automatically sets the correct multipart boundaries.
      },
      body: form
    });

    const uploadData = await uploadRes.json();
    console.log('\n🎯 Upload Result:');
    console.log(uploadData);

  } catch (err) {
    console.error('❌ Test Failed:', err);
  }
}

testCSVUpload();