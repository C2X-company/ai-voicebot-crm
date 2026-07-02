import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { 
  getCurrentAdminTenant, 
  getAdminDashboardStats 
} from '@/lib/actions/admin';
import { connectToDatabase } from "@/lib/db";
import { Campaign, Lead } from "@/lib/models";
import {
  Users2, Megaphone, PhoneCall, TrendingUp,
  ChevronRight, Mic, PhoneMissed, CalendarCheck, 
  Flame, ArrowUpRight, Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Overview | Admin Console' };

type CallStatus = 'interested' | 'voicemail' | 'callback' | 'not-connected';

const statusConfig: Record<CallStatus, {
  label:   string;
  bg:      string;
  text:    string;
  icon:    React.ElementType;
}> = {
  interested:     { label: 'Interested',    bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Flame        },
  voicemail:      { label: 'Voicemail',     bg: 'bg-amber-50',   text: 'text-amber-700',   icon: Mic          },
  callback:       { label: 'Callback',      bg: 'bg-blue-50',    text: 'text-blue-700',    icon: CalendarCheck },
  'not-connected':{ label: 'Not Connected',  bg: 'bg-slate-100',  text: 'text-slate-500',   icon: PhoneMissed  },
};

// Map inner database flags to status UI configurations
const mapIntentToStatus = (status: string, intent?: string): CallStatus => {
  if (status === 'Converted') return 'interested';
  if (intent === 'Hot' || intent === 'Warm') return 'interested';
  if (intent === 'Cold') return 'callback';
  return 'not-connected';
};

export default async function AdminPage() {
  // 1. Authenticate session & verify roles
  const user = await requireAdmin();

  // 2. Resolve Multi-Tenant Scope using the Clerk ID binding
  const tenant = await getCurrentAdminTenant();
  if (!tenant) {
    redirect('/unauthorized');
  }

  const tenantId = tenant.orgId;

  // 3. Fetch Real-time Isolated Context aggregates from MongoDB
  const stats = await getAdminDashboardStats(tenantId);
  
  await connectToDatabase();

  // 4. Fetch the 3 most recent Active/Live Campaigns for this college
  const dbCampaigns = await Campaign.find({ tenantId, status: 'Active' })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // 5. Fetch the 5 most recent Outbound calls that have a history trace
  const dbRecentLeads = await Lead.find({ 
      tenantId, 
      status: { $in: ['Called', 'Converted', 'Failed'] } 
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  // Dynamic Array mapping of layout metrics
  const METRICS = [
    {
      label:   'Total Leads',
      value:   stats.totalLeads?.toLocaleString() || '0',
      change:  stats.totalLeads === 0 ? 'Upload CSV to start' : 'Database fully loaded',
      icon:    Users2,
      color:   'text-blue-600',
      iconBg:  'bg-blue-100',
    },
    {
      label:   'Active Campaigns',
      value:   stats.activeCampaigns?.toString() || '0',
      change:  stats.activeCampaigns === 0 ? 'No automated dials running' : `${stats.activeCampaigns} agents executing`,
      icon:    Megaphone,
      color:   'text-violet-600',
      iconBg:  'bg-violet-100',
    },
    {
      label:   'Calls Completed',
      value:   stats.completedCalls?.toLocaleString() || '0',
      change:  stats.completedCalls === 0 ? 'Awaiting campaign launch' : 'DNC scrubbed targets active',
      icon:    PhoneCall,
      color:   'text-emerald-600',
      iconBg:  'bg-emerald-100',
    },
    {
      label:   'Conversion Rate',
      value:   stats.conversionRate || '0.0%',
      change:  stats.completedCalls === 0 ? 'No intent metrics yet' : 'Calculated by Hot/Warm transcripts',
      icon:    TrendingUp,
      color:   'text-amber-600',
      iconBg:  'bg-amber-100',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {tenant.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700">
            {stats.activeCampaigns || 0} campaigns live
          </span>
        </div>
      </div>

      {/* 4 Core Aggregated Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map(({ label, value, change, icon: Icon, color, iconBg }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            <p className="text-[11px] text-slate-400 mt-2">{change}</p>
          </div>
        ))}
      </div>

      {/* Two-Column Operation Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Left Panel — Live Campaigns */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-slate-800">Active Campaigns</h2>
            </div>
            <Link href="/admin/campaigns" className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-0.5 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 flex-1">
            {dbCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
                <Megaphone className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">No active execution lists running</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Create a voice dialing campaign to begin placing automated Hinglish counselor phone calls.</p>
                <Button asChild size="sm" className="mt-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                  <Link href="/admin/campaigns">
                    <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
                  </Link>
                </Button>
              </div>
            ) : (
              dbCampaigns.map((c: any) => {
                const progressPct = c.totalLeads > 0 ? Math.round((c.completedCalls / c.totalLeads) * 100) : 0;
                return (
                  <div key={c._id.toString()} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Initialized {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
                        LIVE
                      </span>
                    </div>

                    {/* Operational Progress Tracking */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {c.completedCalls?.toLocaleString()} of {c.totalLeads?.toLocaleString()} called
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2 bg-slate-100" />
                    </div>

                    {/* Operational Success Rate metrics */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">{c.conversionRate || '0%'}</span> engagement rate
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel — Recent AI Calls Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-800">Recent AI Calls</h2>
            </div>
            <Link href="/admin/leads" className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-0.5 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 flex-1">
            {dbRecentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
                <PhoneCall className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">No real-time call traces logged</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Once the AI engine connects outbound dials, stream items containing transcripts and conversion states will pipe here.</p>
              </div>
            ) : (
              dbRecentLeads.map((call: any) => {
                const callStatusKey = mapIntentToStatus(call.status, call.intentScore);
                const cfg = statusConfig[callStatusKey];
                const StatusIcon = cfg.icon;
                
                // Process Initials cleanly for avatars
                const initials = call.name ? call.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'ST';
                
                // Format duration nicely from seconds
                const minutes = Math.floor(call.callDuration / 60);
                const seconds = call.callDuration % 60;
                const durationString = `${minutes}m ${seconds}s`;

                return (
                  <div
                    key={call._id.toString()}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Student Initials Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">{initials}</span>
                    </div>

                    {/* Student Metadata Fields */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 leading-none truncate">{call.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-slate-400 font-mono">{call.phone}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[11px] text-slate-400">{durationString}</span>
                      </div>
                    </div>

                    {/* AI Intent Tag badge */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                      <StatusIcon className={`w-3 h-3 ${cfg.text}`} />
                      <span className={`text-[11px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                    </div>

                    {/* Intent Priority Weight Calculation */}
                    {call.intentScore && (
                      <div className="text-right flex-shrink-0 min-w-[40px]">
                        <p className={`text-sm font-bold ${call.intentScore === 'Hot' ? 'text-rose-600' : 'text-slate-800'}`}>
                          {call.intentScore === 'Hot' ? '90+' : call.intentScore === 'Warm' ? '70+' : '40+'}
                        </p>
                        <p className="text-[10px] text-slate-400">score</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}