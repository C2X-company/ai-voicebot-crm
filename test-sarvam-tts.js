require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

// Helper function to pause the script to prevent API Rate Limiting
const delay = ms => new Promise(res => setTimeout(res, ms));

async function testIndianVoice() {
  console.log("Starting Test 1: Pure Hinglish...");
  const response1 = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'API-Subscription-Key': '${process.env.SARVAM_KEY}', 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: ["Namaste Rahul bhai! Mai Indian Institute of information technology,allahabad se bol rahi hoon. Aapka JEE rank 25,000 hai — kya aap hamare IT branch ke baare mein jaan-na chahenge?"],
      target_language_code: "hi-IN",
      speaker: "shreya",
    //   pitch: 0,
      pace: 1.1,
    //   loudness: 1.5,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: "bulbul:v3"
    })
  });

  const data1 = await response1.json();
  if (data1.audios && data1.audios.length > 0) {
    const audio1 = Buffer.from(data1.audios[0], 'base64');
    fs.writeFileSync('test1-hinglish.wav', audio1);
    console.log("✅ Test 1 saved: test1-hinglish.wav");
  } else {
    console.log("❌ Test 1 Failed. API said:", data1);
  }

  // Wait 2 seconds before the next test
  console.log("\nWaiting 2 seconds before Test 2...");
  await delay(2000); 

  console.log("Starting Test 2: Indian English...");
  const response2 = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'API-Subscription-Key': '${process.env.SARVAM_KEY}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: ["The total fees for B.Tech CSE is 1 lakh 20 thousand per year. The placement average last year was 6.5 lakhs per annum."],
      target_language_code: "en-IN", 
      speaker: "priya",
      model: "bulbul:v3"
    })
  });

  const data2 = await response2.json();
  if (data2.audios && data2.audios.length > 0) {
    const audio2 = Buffer.from(data2.audios[0], 'base64');
    fs.writeFileSync('test2-indian-english.wav', audio2);
    console.log("✅ Test 2 saved: test2-indian-english.wav");
  } else {
    console.log("❌ Test 2 Failed. API said:", data2);
  }

  // Wait 2 seconds before the final test
  console.log("\nWaiting 2 seconds before Test 3...");
  await delay(2000);

  console.log("Starting Test 3: Difficult Indian Names...");
  const response3 = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'API-Subscription-Key': '${process.env.SARVAM_KEY}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: ["Hello Venkataraman ji, main Kabir Krishnaswamy bol raha hoon Bengaluru ke Ramaiah Institute se."],
      target_language_code: "hi-IN",
      speaker: "kabir",
      model: "bulbul:v3"
    })
  });

  const data3 = await response3.json();
  if (data3.audios && data3.audios.length > 0) {
    const audio3 = Buffer.from(data3.audios[0], 'base64');
    fs.writeFileSync('test3-indian-names.wav', audio3);
    console.log("✅ Test 3 saved: test3-indian-names.wav");
  } else {
    console.log("❌ Test 3 Failed. API said:", data3);
  }
}

testIndianVoice();