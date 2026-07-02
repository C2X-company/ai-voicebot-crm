require('dotenv').config();

const { Pinecone }            = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { PDFLoader }           = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

async function ingestPDF(pdfPath, collegeId) {
  console.log(`\nLoading PDF: ${pdfPath}`);

  const loader = new PDFLoader(pdfPath);
  const docs   = await loader.load();
  console.log(`Pages loaded: ${docs.length}`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, chunkOverlap: 50
  });
  const chunks = await splitter.splitDocuments(docs);
  console.log(`Chunks created: ${chunks.length}`);

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "gemini-embedding-001", // ✅ Current, supported model
    dimensions: 3072
  });

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index    = pinecone.index('college-knowledge');

  console.log(`Uploading to Pinecone namespace: ${collegeId}`);

  const batchSize = 50;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    // 1. Extract all text from this batch
    const chunkTexts = batch.map(chunk => chunk.pageContent);
    
    // 2. Generate embeddings for the entire batch at once (faster & avoids API rate limits)
    const batchEmbeddings = await embeddings.embedDocuments(chunkTexts);

    // 3. Format vectors exactly as Pinecone expects
    const vectors = batch.map((chunk, j) => ({
      id: `${collegeId}-${i + j}`,
      values: batchEmbeddings[j],
      metadata: { text: chunk.pageContent, college: collegeId }
    }));

    // 4. Upsert using the latest Pinecone object syntax
    await index.upsert({ 
      records: vectors,
      namespace: collegeId 
    });
    
    console.log(`  Uploaded ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`);
  }

  console.log(`\n✅ Done. ${chunks.length} chunks stored for ${collegeId}`);
}

const pdfPath  = process.argv[2] || './college.pdf';
const college  = process.argv[3] || 'iiit-allahabad';
ingestPDF(pdfPath, college).catch(console.error);