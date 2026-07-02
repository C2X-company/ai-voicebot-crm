import { requireAdmin } from "@/lib/auth";
import { getAdminCampaigns } from "@/lib/actions/admin";
import { Megaphone, Calendar, PhoneCall, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// 1. Import your new Client Component Modal!
import { CreateCampaignModal } from "./create-campaign-modal";

export const metadata = { title: "Campaigns | Admin" };

export default async function AdminCampaignsPage() {
  await requireAdmin();
  const campaigns = await getAdminCampaigns() || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Calling Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Manage outbound voice dialing campaigns and track lead conversion.</p>
        </div>

        {/* 2. Inject the clean modal component here */}
        <CreateCampaignModal />
      </div>

      {/* Campaigns Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <Megaphone className="w-4 h-4 text-violet-500 mr-2" />
          <h2 className="text-sm font-semibold text-slate-800">All Campaigns</h2>
          <Badge variant="secondary" className="ml-3 bg-white border-slate-200 text-slate-600 text-[10px]">
            {campaigns.length} Total
          </Badge>
        </div>

        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Megaphone className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No campaigns yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Create your first campaign to upload student leads and start making AI outbound calls.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Campaign Name</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Progress</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c: any) => {
                  const progressPct = c.totalLeads > 0 ? Math.round((c.completedCalls / c.totalLeads) * 100) : 0;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <PhoneCall className="w-3 h-3" /> {c.completedCalls} / {c.totalLeads} calls made
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={
                          c.status === 'Active' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                          c.status === 'Completed' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          'border-slate-200 text-slate-600 bg-slate-100'
                        }>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center gap-3">
                          <Progress value={progressPct} className="h-2 flex-1" />
                          <span className="text-[11px] font-bold text-slate-700 w-8">{progressPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="outline" size="sm" className="h-8 border-slate-200 hover:bg-slate-50 text-slate-700">
                          <Link href={`/admin/campaigns/${c._id}`}>
                            Manage & Call <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}