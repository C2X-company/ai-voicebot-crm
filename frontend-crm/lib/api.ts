// lib/api.ts

import { Campaign, Lead } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic fetch wrapper that attaches Clerk JWT
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  getMe: (getToken: () => Promise<string | null>) =>
    apiFetch('/api/auth/me', {}, getToken),
};

// ── Leads ──────────────────────────────────────────────────────────────────
export const leadsApi = {
  getAll: (
    getToken: () => Promise<string | null>,
    params?: { status?: string; intent?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<{ leads: Lead[]; pagination: any }>(
      `/api/leads${query ? `?${query}` : ''}`,
      {},
      getToken
    );
  },

  getStats: (getToken: () => Promise<string | null>) =>
    apiFetch<{ byStatus: Record<string, number>; byIntent: Record<string, number>; total: number }>(
      '/api/leads/stats',
      {},
      getToken
    ),

  uploadCSV: async (
    getToken: () => Promise<string | null>,
    file: File,
    campaignId: string,
    collegeId: string
  ) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file',       file);
    formData.append('campaignId', campaignId);
    formData.append('collegeId',  collegeId);

    const response = await fetch(`${BASE_URL}/api/leads/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      // Note: DO NOT set Content-Type here — browser sets it with boundary automatically
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Upload failed');
    }
    return response.json();
  },

  updateStatus: (
    getToken: () => Promise<string | null>,
    leadId: string,
    status: string,
    agentNotes?: string
  ) =>
    apiFetch(
      `/api/leads/${leadId}/status`,
      { method: 'PUT', body: JSON.stringify({ status, agentNotes }) },
      getToken
    ),
};

// ── Campaigns ──────────────────────────────────────────────────────────────
export const campaignsApi = {
  create: (
    getToken: () => Promise<string | null>,
    data: { name: string; collegeId: string; maxDailyDialed: number }
  ) =>
    apiFetch('/api/campaigns', {
      method: 'POST',
      body:   JSON.stringify(data)
    }, getToken),

  getAll: (getToken: () => Promise<string | null>) =>
    apiFetch<Campaign[]>('/api/campaigns', {}, getToken),
};