require('dotenv').config();
const fetch = require('node-fetch');

console.log("\n🚀 SCRIPT STARTED\n");

async function makeTestCall() {
  const response = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumberId: `${process.env.PHONE_NUMBER_ID}`, 
      customer: {
        number: `${process.env.TEST_CUSTOMER_NUMBER}`,
        name: "Test Call"
      },
      assistant: {
        name: "Avi",
        firstMessage: "Hello! Main IIIT Allahabad se bol raha hoon. Kya aap sun pa rahe hain?",
        firstMessageMode: "assistant-speaks-first-with-model-generated-message",
        serverUrl: `${process.env.SERVER_URL}/api/webhook/call-ended`,
        serverUrl: `${process.env.SERVER_URL}/call-ended`,

        // ── STT CONFIG ──────────────────────────────────────
        transcriber: {
          provider: "deepgram",
          model: "nova-2-general",
          language: "en-IN",
          endpointing: 500        // 500ms silence = user finished speaking
        },

       // ── LLM CONFIG ──────────────────────────────────────
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: `You are an admissions counselor for IIIT Allahabad.
Start the conversation in natural Hinglish (a mix of Hindi and English). 
CRITICAL LANGUAGE RULE: If the user explicitly states they are more comfortable in English, or asks you to speak in English, you MUST immediately switch to 100% professional English for the rest of the call. Do not use Hindi again.

Keep responses SHORT — maximum 2 sentences per reply.
Ask the student their name, their JEE rank, and which branch they want.
Be warm, professional, and helpful.

Ignore phonetic spelling errors from the speech-to-text transcriber (e.g., "Tamanna" as "Tamela", or "JEE" as "g"). Do not correct the user; reply based on the closest logical meaning.`+
`Tum IIIT Allahabad ke admissions counselor ho. Naam hai Bobby.
Hinglish mein baat karo. Har reply max 2 sentences.

College facts ke liye ALWAYS get_college_info tool use karo.

transfer_to_counselor tool tab use karo jab:
- Student campus visit maange
- Student scholarship negotiate karna chahe  
- Student directly kisi se baat karna maange
- Student bahut interested lage aur detailed discussion chahe
- Student "admission lena hai" ya "apply karna hai" bole

Flow:
1. Student ka naam aur JEE rank poochho
2. Rank ke hisaab se branch suggest karo
3. Questions ka jawab do tool se
4. Agar interested lage — counselor transfer offer karo`
}],
          maxTokens: 150, // keep responses short = faster reply
          
          
          tools: [{
            type: "function",
            messages: [{
              type: "request-start",
              content: "Please allow me just a moment to confirm those exact details for you."
            }],
            function: {
              name: "search_college_db",
              description: "Search the IIIT Allahabad knowledge base for specific facts like fees, placements, directors, or curriculum. USE THIS TOOL INSTEAD OF GUESSING.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The specific question to search for, e.g., 'Who is the director?' or 'Hostel fees'"
                  }
                },
                required: ["query"]
              }
            },
            
            server: {
              url: `${process.env.SERVER_URL}/search-college` // Vapi will hit this new route on your server
            }

          }
        ,{
    type: "function",
    function: {
      name:        "transfer_to_counselor",
      description: "Transfer the call to a human counselor when student is very interested, wants to visit campus, asks about scholarships, or asks to speak to a person",
      parameters: {
        type:       "object",
        properties: {
          reason: {
            type:        "string",
            description: "Why the transfer is happening"
          }
        },
        required: ["reason"]
      }
    },
    server: { url: `${process.env.SERVER_URL}/transfer` }
  }
        ]
      },

        // ── SILENCE & TIMING ─────────────────────────────────
        silenceTimeoutSeconds: 20,        // wait 20s before ending call on silence
        maxDurationSeconds: 300,          // 5 min max call
        backgroundDenoisingEnabled: true, // filter phone background noise

        // ── STOP BOT FROM TALKING OVER YOU ───────────────────
        stopSpeakingPlan: {
          numWords: 2,              // if you say 2 words, bot shuts up immediately
          voiceSeconds: 0.2,
          backoffSeconds: 1
        }
      }
    })
  });

  const data = await response.json();
  console.log("--- VAPI RESPONSE ---");
  console.log(JSON.stringify(data, null, 2));

  if (data.id) {
    console.log(`\n✅ Call fired! ID: ${data.id}`);
    console.log(`📞 Calling`);
  }
}

makeTestCall();