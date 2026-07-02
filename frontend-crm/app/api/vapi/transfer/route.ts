import { NextResponse } from 'next/server';

function extractToolCall(obj: any): any {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.id && (obj.name || obj.function?.name)) return obj;
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      const found = extractToolCall(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let callId = "transfer_fallback";
    const toolCall = extractToolCall(body);

    if (toolCall) {
      callId = toolCall.id;
    } else if (body && Object.keys(body).length > 0) {
      // 💥 THE SMOKING GUN FIX for Transfer
      if (body.toolCallId) callId = body.toolCallId;
    } else {
      console.error('❌ Payload is completely empty.');
      return NextResponse.json({ error: 'No parameters found' }, { status: 400 });
    }

    console.log(`📞 Executing Transfer to Counselor (ID: ${callId})`);

    return NextResponse.json({
      results: [{
        toolCallId: callId,
        result: "Successfully initiated transfer to the counselor."
      }]
    });

  } catch (err: any) {
    console.error('❌ Transfer error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}