import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { extractText } from 'unpdf'; 
import { connectToDatabase } from '@/lib/db';
import { KnowledgeDocument } from '@/lib/models'; // Adjusted based on your lib/models/index.ts structure
import { auth } from '@clerk/nextjs/server'; // 🚨 Added Clerk Auth

export const maxDuration = 60; 

// 1. GET HANDLER: Fetches the stored documents for the UI dashboard
export async function GET() {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json([]); // Return empty if not logged into an org
    }

    await connectToDatabase();
    
    // 🚨 1. Fetch from MongoDB using orgId instead of hardcoded 'iiit-allahabad'
    // Note: In your previous code you used 'namespace', I am assuming your Document schema uses 'tenantId' as we set up earlier. If your schema still expects 'namespace', change tenantId to namespace below.
    const documents = await KnowledgeDocument.find({ tenantId: orgId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST HANDLER: Extracts PDF, uploads vectors to Pinecone, and saves history to MongoDB
export async function POST(req: Request) {
  try {
    // 🚨 2. Grab the current Organization ID
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'You must select an Organization before uploading documents.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    console.log(`📥 Reading PDF cleanly with unpdf: ${file.name} for Org: ${orgId}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(arrayBuffer));
    const rawText = Array.isArray(text) ? text.join('\n\n') : String(text);

    if (!rawText || rawText.trim() === '') {
       throw new Error("The PDF appears to be empty or contains unreadable image-based text.");
    }

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.createDocuments([rawText]);

    console.log(`✂️ Created ${docs.length} knowledge chunks.`);

    const apiKey = process.env.GOOGLE_API_KEY;
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
    
    // 🚨 3. Dynamically set the Pinecone Namespace to the orgId!
    const namespace = pinecone.index('college-knowledge').namespace(orgId);

    const vectors = [];
    
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsRes.json();
    if (!modelsRes.ok) throw new Error(`Google Auth Error: ${modelsData?.error?.message}`);

    const embedModel = modelsData.models?.find((m: any) => m.name.includes('text-embedding-004')) ||
                       modelsData.models?.find((m: any) => m.name.includes('embedding'));

    if (!embedModel) throw new Error("No embedding models unlocked.");

    const modelName = embedModel.name;
    const method = embedModel.supportedGenerationMethods?.includes('embedContent') ? 'embedContent' : 'embedText';

    console.log(`🎯 Using Model: ${modelName} | URL Method: ${method}`);

    for (let i = 0; i < docs.length; i++) {
      const chunkText = docs[i].pageContent;
      if (!chunkText || chunkText.trim() === '') continue;

      let payload = method === 'embedContent' 
          ? { model: modelName, content: { parts: [{ text: chunkText }] } }
          : { text: chunkText };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:${method}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Google API Error: ${data?.error?.message}`);

      const embedding = data?.embedding?.values || data?.embedding?.value;
      if (!embedding || !Array.isArray(embedding)) throw new Error(`Missing numbers from Google.`);

      vectors.push({
         id: `doc-${Date.now()}-${i}`,
         values: embedding,
         metadata: { text: chunkText, source: file.name }
      });
    }

    if (vectors.length === 0) {
       throw new Error("Zero vectors were generated. Halting upload.");
    }

    try {
        await namespace.upsert(vectors as any);
    } catch (err: any) {
        if (err.message && err.message.includes('at least 1 record')) {
            console.log("⚠️ Pinecone rejected the raw array. Adapting to the { records } wrapper format...");
            await namespace.upsert({ records: vectors } as any);
        } else {
            throw err;
        }
    }

    console.log(`🚀 Uploaded ${vectors.length} vectors to Pinecone Namespace: ${orgId}!`);

    await connectToDatabase();
    
    // 🚨 4. Save metadata to MongoDB using the orgId!
    // Note: I am passing tenantId here. Ensure your Document model in lib/models/index.ts has tenantId: String.
    const newDoc = await KnowledgeDocument.create({
      tenantId: orgId, 
      fileName: file.name, 
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      chunkCount: vectors.length,
      // You can keep namespace here if your schema requires it, but tenantId is the standard
      namespace: orgId 
    });

    console.log(`💾 Saved metadata to MongoDB: ${newDoc.fileName}`);

    return NextResponse.json({ 
      success: true, 
      chunks: vectors.length,
      document: newDoc 
    });

  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}