import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileSize: { type: String, default: 'Unknown' },
  chunkCount: { type: Number, default: 0 },
  namespace: { type: String, default: 'iiit-allahabad' },
  uploadedAt: { type: Date, default: Date.now },
});

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);