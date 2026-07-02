import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Lead } from '@/lib/models'; 
import { auth } from '@clerk/nextjs/server'; // 🚨 Switch to Clerk Auth


// Force Next.js to fetch fresh data every time (no caching stale leads)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Authenticate and get the current Organization (College Workspace)
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!orgId) {
      // The user is logged in, but hasn't created a College Organization yet.
      // We return an empty array so the UI loads cleanly without crashing.
      return NextResponse.json([]);
    }

    // 2. Connect to the database
    await connectToDatabase();

    // 3. 🚨 MULTI-TENANCY LOCK: Fetch ONLY the leads for this specific orgId
    const leads = await Lead.find({ tenantId: orgId }).sort({ createdAt: -1 });

    // 4. Send the secured data to the frontend UI
    return NextResponse.json(leads);
    
  } catch (error) {
    console.error("Failed to fetch leads API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}