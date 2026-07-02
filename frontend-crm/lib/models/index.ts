import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 0. PLATFORM CONFIG SCHEMA (Global Settings)
// ==========================================
export interface IPlatformConfig extends Document {
  platformName: string;
  supportEmail: string;
  enforceMFA: boolean;
  masterApiKeys: {
    openai?: string;
    vapi?: string;
    exotel?: string;
  };
  updatedAt: Date;
}

const PlatformConfigSchema = new Schema<IPlatformConfig>({
  platformName: { type: String, default: "VoiceBot CRM Enterprise" },
  supportEmail: { type: String, default: "support@voicebotcrm.com" },
  enforceMFA: { type: Boolean, default: true },
  masterApiKeys: {
    openai: { type: String, default: "" },
    vapi: { type: String, default: "" },
    exotel: { type: String, default: "" },
  }
}, { timestamps: true });

export const PlatformConfig = mongoose.models.PlatformConfig || mongoose.model<IPlatformConfig>('PlatformConfig', PlatformConfigSchema);

// ==========================================
// 1. TENANT SCHEMA (The College/Client Workspace)
// ==========================================
export interface ITenant extends Document {
  orgId: string; // 🚨 CHANGED: This perfectly matches Clerk's Organization ID (e.g., org_2bz...)
  name: string;
  slug: string;
  pineconeNamespace: string;
  clerkAdminId: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  apiKeys?: {
    vapi?: string;
    openai?: string;
    exotel?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  orgId: { type: String, required: true, unique: true, index: true }, // 🚨 CHANGED to String
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  pineconeNamespace: { type: String, required: true, unique: true },
  clerkAdminId: { type: String, required: true},
  plan: { type: String, enum: ['Starter', 'Growth', 'Enterprise'], default: 'Starter' },
  apiKeys: {
    vapi: { type: String },
    openai: { type: String },
    exotel: { type: String },
  }
}, { 
  timestamps: true, 
  collection: 'colleges' 
});

export const Tenant = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);

// ==========================================
// 2. CAMPAIGN SCHEMA (Admin AI Calling Jobs)
// ==========================================
export interface ICampaign extends Document {
  tenantId: string; // 🚨 CHANGED: Changed from ObjectId to String to match Clerk's orgId
  name: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Paused';
  totalLeads: number;
  completedCalls: number;
  conversionRate: number;
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  tenantId: { type: String, required: true, index: true }, // 🚨 CHANGED to String
  name: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Paused'], default: 'Draft' },
  totalLeads: { type: Number, default: 0 },
  completedCalls: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
}, { timestamps: true });

export const Campaign = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

// ==========================================
// 3. LEAD SCHEMA (Student Contacts)
// ==========================================
export interface ILead extends Document {
  tenantId: string; // 🚨 CHANGED: Changed from ObjectId to String to match Clerk's orgId
  campaignId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  status: 'New' | 'Called' | 'Converted' | 'Failed' | 'Queued' | 'Calling'; // Added Queued and Calling for Vapi
  intentScore?: 'Hot' | 'Warm' | 'Cold';
  callDuration?: number;
  transcript?: string; 
  summary?: string; 
  recordingUrl?: string;  
}

const LeadSchema = new Schema<ILead>({
  tenantId: { type: String, required: true, index: true }, // 🚨 CHANGED to String
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['New', 'Queued', 'Calling', 'Called', 'Converted', 'Failed'], default: 'New' },
  intentScore: { type: String, enum: ['Hot', 'Warm', 'Cold'] },
  callDuration: { type: Number, default: 0 },
  transcript: { type: String, default: "" }, 
  summary: { type: String, default: "" },
  recordingUrl: { type: String, default: "" },    
}, { timestamps: true });

// 🚨 THE FIX: Add this Compound Index!
// This makes phone numbers unique ONLY within the specific Organization.
LeadSchema.index({ tenantId: 1, phone: 1 }, { unique: true });

export const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);


// ==========================================
// 4. KNOWLEDGE BASE DOCUMENT SCHEMA
// ==========================================
export interface IKnowledgeDocument extends Document { // Changed from IDocument
  tenantId: string; // The Clerk Org ID
  fileName: string;
  fileSize: string;
  chunkCount: number;
  namespace?: string; 
  createdAt: Date;
}

const KnowledgeDocumentSchema = new Schema<IKnowledgeDocument>({
  tenantId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileSize: { type: String, default: '0 MB' },
  chunkCount: { type: Number, default: 0 },
  namespace: { type: String }
}, { timestamps: true });

// 🚨 Renamed export to KnowledgeDocument
export const KnowledgeDocument = mongoose.models.KnowledgeDocument || mongoose.model<IKnowledgeDocument>('KnowledgeDocument', KnowledgeDocumentSchema);

