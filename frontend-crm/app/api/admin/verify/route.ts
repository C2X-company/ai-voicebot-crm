import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

// Force Next.js to fetch fresh data every time
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
    const index = pinecone.index('college-knowledge');

    // 🚨 Ask the Pinecone server directly (bypasses the slow web UI)
    const stats = await index.describeIndexStats();

    return NextResponse.json({
      success: true,
      message: "Here is the LIVE data inside your Pinecone database!",
      liveData: stats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}