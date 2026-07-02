import { requireSuperadmin } from '@/lib/auth';
import { getPlatformMetrics, getAllTenants } from "@/lib/actions/superadmin";
import Link from 'next/link';
import {
  Building2, Zap, DollarSign, TrendingUp,
  ArrowUpRight, AlertTriangle, CheckCircle2,
  Clock, Activity, Loader2
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Overview | Superadmin' };

// ── Component Support Maps ───────────────────────────────────────────
const accentMap: Record<string, string> = {
  violet:  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  blue:    'bg-blue-500/15    text-blue-300    border-blue-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  amber:   'bg-amber-500/15   text-amber-300   border-amber-500/20',
};

const iconBgMap: Record<string, string> = {
  violet:  'bg-violet-500/20',
  blue:    'bg-blue-500/20',
  emerald: 'bg-emerald-500/20',
  amber:   'bg-amber-500/20',
};

const iconColorMap: Record<string, string> = {
  violet:  'text-violet-400',
  blue:    'text-blue-400',
  emerald: 'text-emerald-400',
  amber:   'text-amber-400',
};

const planColors: Record<string, string> = {
  Starter:    'bg-slate-700/60 text-slate-300 border-slate-600',
  Growth:     'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Enterprise: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
};

// Helper to determine quota based on DB plan
const getQuota = (plan: string) => {
  const p = plan?.toLowerCase();
  if (p === 'enterprise') return 50000;
  if (p === 'growth') return 20000;
  return 5000;
};

// Helper to render API key status from the DB
function KeyStatus({ status }: { status?: string }) {
  if (!status || status === 'missing') {
    return (
      <div className="flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[11px] text-red-400 font-medium">Missing</span>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span className="text-[11px] text-amber-400 font-medium">Pending</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span className="text-[11px] text-emerald-400 font-medium">Active</span>
    </div>
  );
}

export default async function SuperadminPage() {
  await requireSuperadmin();

  // ── Fetch Live DB Metrics & Tenant List ───────────────────────────────
  const metricsData = await getPlatformMetrics();
  const liveTenantCount = metricsData.success ? metricsData.activeTenants.toString() : "0";
  
  // Fetch the actual array of tenants from MongoDB
  const dbTenants = await getAllTenants() || [];
  
  // Grab only the 5 most recent for the dashboard preview
  const recentTenants = dbTenants.slice(0, 5);

  const METRICS = [
    {
      label:   'Active Tenants',
      value:   liveTenantCount,
      change:  liveTenantCount === "0" ? 'Awaiting onboarding' : `+${liveTenantCount} initialized`,
      up:      true,
      icon:    Building2,
      accent:  'violet',
    },
    {
      label:   'API Minutes Used',
      value:   '0', // Will become dynamic once the telephony engine is built
      change:  '0% of quota',
      up:      true,
      icon:    Zap,
      accent:  'blue',
    },
    {
      label:   'Platform Revenue',
      value:   '₹0', // Will become dynamic with billing engine
      change:  'Pending first billing',
      up:      true,
      icon:    DollarSign,
      accent:  'emerald',
    },
    {
      label:   'Avg. Conversion',
      value:   '--', // Will become dynamic with Admin campaigns
      change:  'Awaiting call data',
      up:      true,
      icon:    TrendingUp,
      accent:  'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Platform Overview
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time health across all tenants · Updated just now
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map(({ label, value, change, up, icon: Icon, accent }) => (
          <div
            key={label}
            className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5
                       hover:border-slate-600/80 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgMap[accent]}`}>
                <Icon className={`w-4 h-4 ${iconColorMap[accent]}`} />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <div className={`mt-3 inline-flex items-center gap-1 text-[10px] font-semibold
                            px-2 py-0.5 rounded-full border ${accentMap[accent]}`}>
              {up ? '↑' : '↓'} {change}
            </div>
          </div>
        ))}
      </div>

      {/* Tenant table */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-200">Recent Tenants</h2>
            <span className="px-2 py-0.5 bg-slate-700/60 text-slate-400 text-[11px]
                             font-medium rounded-full">
              {recentTenants.length} showing
            </span>
          </div>
          
          {/* FIX: Properly wired Next.js Link to the full tenants page */}
          <Link href="/superadmin/tenants" 
                className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/40">
                {['College', 'Plan', 'API Minutes', 'Vapi', 'Exotel', 'OpenAI', 'Joined'].map(h => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-[11px] font-semibold
                               text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTenants.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">
                     No colleges provisioned yet.
                   </td>
                 </tr>
              ) : (
                recentTenants.map((t: any) => {
                  const quota = getQuota(t.plan);
                  // Real usage metrics will be implemented in Phase 3. Defaulting to 0.
                  const minutesUsed = 0; 
                  const progressPct = (minutesUsed / quota) * 100;

                  return (
                    <tr
                      key={t._id}
                      className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                    >
                      {/* College (Real Data) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700
                                          flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-slate-300 uppercase">
                              {t.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 text-[13px]">{t.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{t.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan (Real Data) */}
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border
                                         ${planColors[t.plan] || planColors.Starter}`}>
                          {t.plan}
                        </span>
                      </td>

                      {/* Minutes with progress (Dynamic Quota) */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[11px] text-slate-300 font-mono">
                              {minutesUsed.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              / {quota.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                progressPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Key statuses (Real DB State) */}
                      <td className="px-6 py-4"><KeyStatus status={t.apiKeys?.vapi} /></td>
                      <td className="px-6 py-4"><KeyStatus status={t.apiKeys?.exotel} /></td>
                      <td className="px-6 py-4"><KeyStatus status={t.apiKeys?.openai} /></td>

                      {/* Joined Date (Real Data) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}