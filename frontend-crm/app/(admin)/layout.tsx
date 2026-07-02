// app/(admin)/layout.tsx
import { auth } from '@clerk/nextjs/server'; // 🚨 Use Clerk directly
import { UserButton } from '@clerk/nextjs';
import { AdminNav } from '@/components/admin/admin-nav';
import { getCurrentAdminTenant, getAdminDashboardStats } from '@/lib/actions/admin';
import { Building2, TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminHeader } from '@/components/admin/admin-header'; 
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: { template: '%s | Admin Portal', default: 'Admin Portal' }
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. 🚨 Get the native Clerk session
  const { userId, orgId } = await auth();

  // 2. If not logged in, boot them to sign-in
  if (!userId) {
    redirect('/sign-in');
  }

  // 3. If they haven't created or selected an organization in Clerk yet
  if (!orgId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
         <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Workspace Required</h1>
            <p className="text-slate-500 mb-6">You need to create or select an organization to view this dashboard.</p>
            {/* The OrganizationSwitcher allows them to create one right here if they haven't */}
            <div className="flex justify-center">
              <UserButton />
            </div>
         </div>
      </div>
    );
  }

  // 4. Fetch real tenant and stats from MongoDB using the new robust logic
  const tenant = await getCurrentAdminTenant();
  let stats = { completedCalls: 0, conversionRate: '0.0%' };
  
  if (tenant) {
    const dbStats = await getAdminDashboardStats(tenant.orgId);
    if (dbStats.success) {
      stats.completedCalls = dbStats.completedCalls || 0;
      stats.conversionRate = dbStats.conversionRate || '0.0%';
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Light Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col bg-white border-r border-slate-200/80">
        
        {/* College identity header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200/50 flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-none truncate">
              {/* 🚨 Use the tenant name from DB, fallback to generic */}
              {tenant?.name || 'Workspace Admin'}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 tracking-wide">
              ADMISSIONS HEAD
            </p>
          </div>
        </div>

        {/* Today's quick live stat badge */}
        <div className="mx-3 mt-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                  Live Stats
                </span>
              </div>
              <span className="text-[10px] text-emerald-500">Live</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-bold text-emerald-800 leading-none">{stats.completedCalls}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">calls placed</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-700">{stats.conversionRate}</p>
                <p className="text-[10px] text-emerald-500">connect rate</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                style={{ width: `${Math.min(parseInt(stats.conversionRate), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <AdminNav />

        {/* Plan tiers + User Profile actions */}
        <div className="flex-shrink-0 p-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl px-3 py-2 border border-violet-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-violet-700">Growth Plan</span>
            </div>
            <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] font-bold px-1.5 py-0 rounded-md">
              ACTIVE
            </Badge>
          </div>

          <div className="flex items-center gap-3 px-1 py-0.5">
            <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 leading-none">Admin Portal</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                 Logged In
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}