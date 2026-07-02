import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export const maxDuration = 60; 

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
    console.log("📥 Raw Vapi Payload:", JSON.stringify(body, null, 2));

    let args: any = {};
    let callId = "tool_call_fallback"; 
    
    // 🚨 1. Extract the orgId from the Vapi metadata we passed during call creation
    // Vapi usually sends the call metadata in `body.message.call.metadata`
    let orgId = body?.message?.call?.metadata?.orgId || 'iiit-allahabad'; // Fallback for old calls

    const toolCall = extractToolCall(body);
    
    if (toolCall) {
      args = toolCall.arguments || toolCall.function?.arguments || {};
      if (typeof args === 'string') {
          try { args = JSON.parse(args); } catch (e) { args = {}; }
      }
      callId = toolCall.id;
    } else {
      if (body && Object.keys(body).length > 0) {
        console.log("⚠️ No envelope found. Treating raw body as search arguments.");
        args = body;
        if (body.toolCallId) callId = body.toolCallId;
      } else {
        console.error('❌ Payload is completely empty.');
        return NextResponse.json({ error: 'No parameters found' }, { status: 400 });
      }
    }

    const userQuery = args.query || args.question || args.search_term || Object.values(args)[0] || "General placement information"; 
    console.log(`🔍 Searching Pinecone for: "${userQuery}" inside Namespace: "${orgId}"`);

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
    const index = pinecone.index('college-knowledge'); 
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'gemini-embedding-001'
    });

    const queryEmbedding = await embeddings.embedQuery(String(userQuery));

    // 🚨 2. BRAIN LOCK: We dynamically query ONLY the orgId namespace!
    const results = await index.namespace(orgId).query({ 
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    });

    const contexts = results.matches.map((m: any) => m.metadata?.text).join('\n\n');

    return NextResponse.json({
      results: [{
        toolCallId: callId,
        result: contexts || 'I could not find information about this in the database.'
      }]
    });

  } catch (err: any) {
    console.error('❌ RAG error:', err.message);
    return NextResponse.json({ 
      results: [{
        toolCallId: 'error',
        result: 'Database connection error.'
      }] 
    });
  }
}