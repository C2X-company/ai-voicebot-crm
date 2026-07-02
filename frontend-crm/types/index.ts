// types/index.ts

export type UserRole = 'superadmin' | 'college_admin' | 'agent';

export interface College {
  _id:               string;
  name:              string;
  slug:              string;
  pineconeNamespace: string;
  plan:              'starter' | 'growth' | 'enterprise';
}

export interface Lead {
  _id:                string;
  name:               string;
  phone:              string;
  email?:             string;
  city?:              string;
  jeeRank?:           number;
  branchInterest?:    string;
  college:            College | string;
  status:             LeadStatus;
  intent:             'hot' | 'warm' | 'cold' | 'unknown';
  attempts:           number;
  lastCalledAt?:      string;
  transferRequested:  boolean;
  latestTranscript?:  string;
  latestSummary?:     string;
  latestRecordingUrl?: string;
  agentNotes?:        string;
  createdAt:          string;
}

export type LeadStatus =
  | 'pending'
  | 'calling'
  | 'no_answer'
  | 'not_interested'
  | 'qualified'
  | 'transferred'
  | 'enrolled'
  | 'dnd';

export interface Campaign {
  _id:             string;
  name:            string;
  college:         string;
  status:          'draft' | 'active' | 'paused' | 'completed';
  callWindowStart: number;
  callWindowEnd:   number;
  maxDailyDialed:  number;
  totalLeads:      number;
  called:          number;
  qualified:       number;
  createdAt:       string;
}

export interface LeadStats {
  byStatus: Record<LeadStatus, number>;
  byIntent: Record<string, number>;
  total:    number;
}

export interface PaginatedLeads {
  leads:      Lead[];
  pagination: {
    total:  number;
    page:   number;
    pages:  number;
    limit:  number;
  };
}