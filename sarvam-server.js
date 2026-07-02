// server.js
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const fetch    = require('node-fetch');

// Models
const Lead    = require('./models/Lead');
const College = require('./models/College');

// Pinecone + Google Embeddings
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

const pinecone   = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index      = pinecone.index('college-knowledge');
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey:    process.env.GOOGLE_API_KEY,
  modelName: 'gemini-embedding-001'
});

const app  = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// 1. CORS
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',            // Next.js dev
    process.env.FRONTEND_URL || ''      // Production frontend URL
  ],
  credentials: true
}));

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLERK WEBHOOK — MUST be before express.json()
//    Svix needs raw body to verify signature
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/webhooks', require('./routes/webhook'));

// ─────────────────────────────────────────────────────────────────────────────
// 3. JSON BODY PARSER — after Clerk webhook, before everything else
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// 4. MONGODB
// ─────────────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ─────────────────────────────────────────────────────────────────────────────
// 5. CRM API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/leads',     require('./routes/leads'));
app.use('/api/campaigns', require('./routes/campaign'));

// ─────────────────────────────────────────────────────────────────────────────
// 6. VAPI WEBHOOK — after express.json() so body is parsed
//    Different from Clerk webhook — no raw body needed
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/webhook', require('./routes/vapihook'));

// ─────────────────────────────────────────────────────────────────────────────
// 7. SARVAM TTS — called by Vapi for every bot utterance
// ─────────────────────────────────────────────────────────────────────────────
app.post('/synthesize', async (req, res) => {
  console.log('\n======= VAPI SYNTHESIZE REQUEST =======');

  const text = req.body?.text
    || req.body?.message?.text
    || req.body?.input
    || req.body?.messages?.[req.body.messages?.length - 1]?.content;

  if (!text) {
    console.log('❌ No text found in body');
    return res.status(400).json({ error: 'No text provided' });
  }

  console.log(`🗣️  Speaking: "${text}"`);

  try {
    const sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'API-Subscription-Key': process.env.SARVAM_KEY,
        'Content-Type':         'application/json'
      },
      body: JSON.stringify({
        inputs:               [text],
        target_language_code: 'en-IN',
        speaker:              'kabir',
        pace:                 1.0,
        speech_sample_rate:   16000,
        enable_preprocessing: true,
        model:                'bulbul:v3'
      })
    });

    const data = await sarvamResponse.json();

    if (data.audios?.[0]) {
      const audioBuffer = Buffer.from(data.audios[0], 'base64');
      console.log(`✅ Sending ${audioBuffer.length} bytes to Vapi`);
      res.set('Content-Type', 'audio/wav');
      res.send(audioBuffer);
    } else {
      console.log('❌ Sarvam error:', data);
      res.status(500).json({ error: 'Sarvam failed', detail: data });
    }

  } catch (err) {
    console.error('❌ Synthesize crash:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. PINECONE RAG SEARCH — called by Vapi as a tool during calls
// ─────────────────────────────────────────────────────────────────────────────
app.post('/search-college', async (req, res) => {
  console.log('\n======= VAPI TOOL CALL — RAG SEARCH =======');

  try {
    const toolCall = req.body?.message?.toolCalls?.[0];
    if (!toolCall) {
      return res.status(400).json({ error: 'No tool call found' });
    }

    let args = toolCall.function.arguments;
    if (typeof args === 'string') args = JSON.parse(args);

    const userQuery = args.query;
    const collegeNs = args.namespace || 'iiit-allahabad';

    console.log(`🔍 Searching: "${userQuery}" in namespace: ${collegeNs}`);

    const queryEmbedding = await embeddings.embedQuery(userQuery);

    const results = await index.namespace(collegeNs).query({
      vector:          queryEmbedding,
      topK:            6,
      includeMetadata: true
    });

    const contexts = results.matches
      .map(m => m.metadata.text)
      .join('\n\n---\n\n');

    console.log(`✅ Found ${results.matches.length} chunks — sending to bot`);

    res.json({
      results: [{
        toolCallId: toolCall.id,
        result:     contexts || 'Mujhe iski information database mein nahi mili.'
      }]
    });

  } catch (err) {
    console.error('❌ RAG error:', err.message);
    res.json({
      results: [{
        toolCallId: req.body?.message?.toolCalls?.[0]?.id,
        result:     'Database error. Please try again.'
      }]
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. TRANSFER TO COUNSELOR — called by Vapi as a tool when student is interested
// ─────────────────────────────────────────────────────────────────────────────
app.post('/transfer', async (req, res) => {
  console.log('\n🔀 TRANSFER REQUESTED');

  try {
    const toolCall = req.body?.message?.toolCalls?.[0];
    const args     = typeof toolCall?.function?.arguments === 'string'
      ? JSON.parse(toolCall.function.arguments)
      : toolCall?.function?.arguments;

    const reason = args?.reason || 'Student requested transfer';
    const phone  = req.body?.message?.call?.customer?.number;

    console.log(`Phone: ${phone} | Reason: ${reason}`);

    if (phone) {
      const updated = await Lead.findOneAndUpdate(
        { phone },
        {
          $set: {
            transferRequested: true,
            transferReason:    reason,
            status:            'transferred',
            intent:            'hot'
          }
        },
        { new: true }
      );
      console.log(updated
        ? `✅ Lead ${phone} marked as transferred`
        : `⚠️  Lead ${phone} not found in MongoDB`
      );
    }

    res.json({
      results: [{
        toolCallId: req.body?.message?.toolCalls?.[0]?.id,
        result:     'Bilkul! Main aapko hamare senior counselor se connect karti hoon. Ek second please.'
      }]
    });

  } catch (err) {
    console.error('❌ Transfer error:', err.message);
    res.json({
      results: [{
        toolCallId: req.body?.message?.toolCalls?.[0]?.id,
        result:     'Counselor se connect karne mein problem aa rahi hai. Please hold karein.'
      }]
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. RESULTS — quick read for dashboard (no auth for now)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/results', async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('college', 'name slug')
      .sort({ lastCalledAt: -1 })
      .limit(100);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'alive',
    db:      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time:    new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. START
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`\nRoutes:`);
  console.log(`  POST /api/webhooks/clerk    — Clerk user sync`);
  console.log(`  POST /api/webhook/call-ended — Vapi call results`);
  console.log(`  GET  /api/leads             — All leads`);
  console.log(`  GET  /api/leads/stats       — Lead statistics`);
  console.log(`  PUT  /api/leads/:id/status  — Update lead`);
  console.log(`  POST /api/leads/upload      — CSV upload`);
  console.log(`  GET  /api/campaigns         — All campaigns`);
  console.log(`  POST /api/campaigns         — Create campaign`);
  console.log(`  POST /synthesize            — Sarvam TTS`);
  console.log(`  POST /search-college        — Pinecone RAG`);
  console.log(`  POST /transfer              — Counselor handoff`);
});