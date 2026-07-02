import { requireAdmin } from "@/lib/auth";
import { getCampaignById, getCampaignLeads } from "@/lib/actions/admin";
import { notFound } from "next/navigation";
import { AutoRefresh } from "./auto-refresh"; // Make sure the path matches where you saved it
import Link from "next/link";
import { 
  ArrowLeft, PhoneCall, UploadCloud, Play, 
  Pause, Users, Activity, Flame 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CsvUploadButton } from "./csv-upload-button";
import { StartCallingButton } from "./start-calling-button";

export const metadata = { title: "Campaign Control | Admin" };

// 🚨 THIS IS THE MAGIC LINE THAT KILLS THE CACHE 🚨
export const dynamic = "force-dynamic";

export default async function CampaignControlPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  
  // Unwrap the URL parameters
  const params = await props.params;
  const campaignId = params.id;

  console.log(`🚀 DEBUG: Page Component is actively rendering for ID: ${campaignId}`);

  // Fetch the specific campaign and its leads
  const campaign = await getCampaignById(campaignId);
  const leads = await getCampaignLeads(campaignId);

  // If someone types a random ID in the URL, kick them to a 404 page
  if (!campaign) {
    console.log(`❌ DEBUG: Page Component triggered notFound()`);
    notFound();
  }

  const progressPct = campaign.totalLeads > 0 
    ? Math.round((campaign.completedCalls / campaign.totalLeads) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AutoRefresh isActive={campaign.status === 'Active'} />
      
      {/* Back Button & Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link 
            href="/admin/campaigns" 
            className="text-sm text-slate-500 hover:text-violet-600 flex items-center gap-1 mb-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.name}</h1>
            <Badge variant="outline" className={
              campaign.status === 'Active' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
              campaign.status === 'Completed' ? 'border-blue-200 text-blue-700 bg-blue-50' :
              'border-slate-200 text-slate-600 bg-slate-100'
            }>
              {campaign.status}
            </Badge>
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex items-center gap-3">
          <CsvUploadButton campaignId={campaignId} />
          
         <StartCallingButton 
          campaignId={campaignId} 
          isDisabled={campaign.status === 'Active' || leads.length === 0} 
        />
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-700">Total Leads</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{campaign.totalLeads}</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PhoneCall className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">Completed Calls</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{campaign.completedCalls}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-700">Overall Progress</h3>
            </div>
            <span className="text-sm font-bold text-slate-700">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2.5 mt-4 bg-slate-100" />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-800">Campaign Leads Execution</h2>
          <span className="text-xs font-medium text-slate-500">{leads.length} queued</span>
        </div>

        {leads.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-slate-900 font-medium">No leads uploaded</h3>
            <p className="text-sm text-slate-500 mt-1">Upload a CSV file containing student names and phone numbers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase">Student Name</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase">Phone</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase">Intent</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase">Duration</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase">Recording</th>
          
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead: any) => (
                  <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{lead.phone}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">{lead.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {lead.intentScore ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Flame className="w-3 h-3" /> {lead.intentScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {lead.callDuration ? `${lead.callDuration}s` : '-'}
                      </td>
                      {/* 🚨 ADD THIS NEW AUDIO PLAYER CELL */}
                  <td className="px-6 py-4">
                    {lead.recordingUrl ? (
                      <audio 
                        src={lead.recordingUrl} 
                        controls 
                        className="h-8 w-48 rounded-md bg-slate-50" 
                      />
                    ) : (
                      <span className="text-slate-400 text-xs italic border border-slate-100 rounded px-2 py-1 bg-slate-50">No audio</span>
                    )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}