import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const text = body?.text 
      || body?.message?.text 
      || body?.input 
      || "Namaste";

    // ✨ FIX 1: Dynamically grab Vapi's requested sample rate, default to 8000 for phone calls
    const sampleRate = body?.message?.sampleRate || body?.sampleRate || 8000;

    console.log(`🗣️ Speaking via Sarvam: "${text}" at ${sampleRate}Hz`);

    const sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        // ✨ FIX 2: Added SARVAM_API_KEY fallback to match your Vercel variables
        'API-Subscription-Key': process.env.SARVAM_API_KEY || process.env.SARVAM_KEY || '', 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: 'en-IN',
        speaker: 'kabir',
        pace: 1.05, // Slight bump in pace to keep it conversational
        speech_sample_rate: sampleRate, // 👈 Passing the correct phone-call speed
        enable_preprocessing: true,
        model: 'bulbul:v3'
      })
    });

    const data = await sarvamResponse.json();

    if (data.audios?.[0]) {
      const audioBuffer = Buffer.from(data.audios[0], 'base64');
      return new NextResponse(audioBuffer, {
        headers: { 
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length.toString()
        }
      });
    } else {
      console.error('❌ Sarvam failed:', data);
      return NextResponse.json({ error: 'Sarvam failed', detail: data }, { status: 500 });
    }
  } catch (err: any) {
    console.error('❌ Synthesize crash:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}