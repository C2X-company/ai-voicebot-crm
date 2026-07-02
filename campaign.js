require('dotenv').config();
const fetch   = require('node-fetch');
const { scrubDND }                    = require('./dnd-scrub');
const { importCSV, getPending, getRetry, updateLead, loadLeads } = require('./lead-manager');

const CONFIG = {
  vapiKey:         process.env.VAPI_KEY,
  phoneNumberId:   process.env.PHONE_NUMBER_ID,
  serverUrl:       process.env.SERVER_URL,
  dailyLimit:      50,
  batchSize:       3,    // 3 at a time — safe for Twilio trial
  gapBetweenCalls: 3000, // 3 seconds between calls
  callWindowStart: 9,
  callWindowEnd:   21,
};

function inCallingWindow() {
  const h = new Date().getHours();
  return h >= CONFIG.callWindowStart && h < CONFIG.callWindowEnd;
}

async function callLead(lead) {
  console.log(`\n📞 Calling ${lead.name} — ${lead.phone}`);

  updateLead(lead.phone, {
    status:      'calling',
    last_called: new Date().toISOString(),
    attempts:    (lead.attempts || 0) + 1
  });

  try {
    const res  = await fetch('https://api.vapi.ai/call', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.vapiKey}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        phoneNumberId: CONFIG.phoneNumberId,
        customer:      { number: lead.phone, name: lead.name },
        assistant: {
          serverUrl:   `${CONFIG.serverUrl}/call-ended`,
          firstMessage: `Hello ${lead.name} ji! Main IIIT Allahabad ke admissions office se bol rahi hoon. Kya aap abhi baat kar sakte hain?`,

          transcriber: {
            provider:    'deepgram',
            model:       'nova-2-phonecall',
            language:    'hi',
            endpointing: 500,
            keywords: [
              'admission:3','JEE:3','branch:2',
              'fees:2','CSE:3','placement:2',
              'scholarship:2','IIIT:3','cutoff:3'
            ]
          },

          model: {
            provider: 'openai',
            model:    'gpt-4o-mini',
            messages: [{
              role:    'system',
              content: `Tum IIIT Allahabad ke admissions counselor ho. Naam hai Priya.
Hinglish mein baat karo. Har reply max 2 sentences.
Student: ${lead.name}, City: ${lead.city || 'unknown'}, JEE Rank: ${lead.jee_rank || 'unknown'}.
College facts ke liye ALWAYS get_college_info tool use karo.
Agar student bahut interested lage ya campus visit maange — transfer_to_counselor tool use karo.`
            }],
            maxTokens: 120
          },

          voice: {
            provider: 'custom-voice',
            server: {
              url:     `${CONFIG.serverUrl}/synthesize`,
              headers: { 'ngrok-skip-browser-warning': 'true' }
            }
          },

          tools: [
            {
              type: 'function',
              function: {
                name:        'get_college_info',
                description: 'Get fees, placements, courses, hostel info from college database',
                parameters: {
                  type: 'object',
                  properties: { query: { type: 'string' } },
                  required: ['query']
                }
              },
              server: { url: `${CONFIG.serverUrl}/get-info` }
            },
            {
              type: 'function',
              function: {
                name:        'transfer_to_counselor',
                description: 'Transfer to human counselor when student is very interested',
                parameters: {
                  type: 'object',
                  properties: { reason: { type: 'string' } },
                  required: ['reason']
                }
              },
              server: { url: `${CONFIG.serverUrl}/transfer` }
            }
          ],

          silenceTimeoutSeconds:      25,
          maxDurationSeconds:         300,
          backgroundDenoisingEnabled: true,
          stopSpeakingPlan: {
            numWords: 2, voiceSeconds: 0.2, backoffSeconds: 1.5
          }
        }
      })
    });

    const data = await res.json();

    if (data.id) {
      console.log(`  ✅ Call fired — ${data.id}`);
      updateLead(lead.phone, { vapi_call_id: data.id });
    } else {
      console.log(`  ❌ Failed:`, data);
      updateLead(lead.phone, { status: 'pending' });
    }

  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    updateLead(lead.phone, { status: 'pending' });
  }
}

async function runCampaign(csvPath) {
  console.log('\n══════════════════════════════════');
  console.log('     CAMPAIGN STARTING');
  console.log('══════════════════════════════════\n');

  // 1. Import CSV
  const fs  = require('fs');
  const csv = fs.readFileSync(csvPath, 'utf8');
  importCSV(csv);

  // 2. Check calling window
  if (!inCallingWindow()) {
    console.log(`⏰ Outside calling hours (9AM–9PM). Not firing calls.`);
    return;
  }

  // 3. Get leads to call
  const pending = getPending(CONFIG.batchSize);
  const retry   = getRetry(CONFIG.batchSize - pending.length);
  const toCall  = [...pending, ...retry];

  if (toCall.length === 0) {
    console.log('No leads to call right now.');
    printSummary();
    return;
  }

  // 4. DND scrub
  const dndSet = await scrubDND(toCall);
  const { updateLead: ul } = require('./lead-manager');
  dndSet.forEach(phone => ul(phone, { status: 'dnd' }));

  const cleared = toCall.filter(l => !dndSet.has(l.phone));
  console.log(`\n${cleared.length} leads cleared to call.\n`);

  // 5. Fire calls
  for (const lead of cleared) {
    await callLead(lead);
    await new Promise(r => setTimeout(r, CONFIG.gapBetweenCalls));
  }

  printSummary();
}

function printSummary() {
  const leads  = loadLeads();
  const counts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  console.log('\n── Summary ───────────────────────');
  const icons = { done:'✅', calling:'📞', no_answer:'📵', dnd:'🚫', pending:'⏳' };
  Object.entries(counts).forEach(([s, n]) =>
    console.log(`  ${icons[s]||'•'} ${s.padEnd(12)} ${n}`)
  );
  console.log('───────────────────────────────────');
}

// Run
const csvFile = process.argv[2] || './sample-leads.csv';
runCampaign(csvFile).catch(console.error);