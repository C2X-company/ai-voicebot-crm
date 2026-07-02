import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, PhoneCall, Cpu, MessageSquare, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";

export const metadata = { title: 'Platform Usage | Superadmin' };

export default function SuperadminUsagePage() {
  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">Platform Usage & Metering</h1>
        <p className="text-sm text-slate-400 mt-2">
          Monitor real-time infrastructure consumption, provider limits, and tenant-level billing metrics.
        </p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">Total Voice Minutes</p>
              <PhoneCall className="h-4 w-4 text-violet-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-50">142,590</h2>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across 18 active tenants this month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">LLM Tokens (OpenAI)</p>
              <Cpu className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-50">4.2B</h2>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">GPT-4o & GPT-3.5-Turbo combined</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">SMS / WhatsApp</p>
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-50">89,204</h2>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +24%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Lead status notifications sent</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">Est. Provider Cost</p>
              <TrendingUp className="h-4 w-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-50">$3,420</h2>
              <span className="text-xs font-medium text-rose-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +5%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Current billing cycle accumulation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Quotas */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              Provider Consumption
            </CardTitle>
            <CardDescription className="text-slate-400">Current limits against master API accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vapi Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-200">Vapi (Voice AI)</span>
                <span className="text-slate-400">142k / 250k mins</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>

            {/* OpenAI Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-200">OpenAI (LLM)</span>
                <span className="text-slate-400">4.2B / 10B tokens</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            {/* Exotel Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-200">Exotel (Telephony)</span>
                <span className="text-slate-400">88% of rate limit</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Tenants */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Top Consuming Tenants
            </CardTitle>
            <CardDescription className="text-slate-400">Colleges driving the highest infrastructure load.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "IIIT Allahabad", usage: "45,230 mins", cost: "$1,120", status: "High Volume", color: "border-rose-500/30 text-rose-400 bg-rose-500/10" },
                { name: "Delhi University", usage: "32,100 mins", cost: "$840", status: "Nominal", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
                { name: "VIT Vellore", usage: "28,450 mins", cost: "$710", status: "Nominal", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
                { name: "BITS Pilani", usage: "12,800 mins", cost: "$320", status: "Scaling Up", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
              ].map((tenant, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-800/60 bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="font-medium text-slate-200 text-sm">{tenant.name}</p>
                    <p className="text-xs text-slate-500">{tenant.usage} • Est. {tenant.cost}</p>
                  </div>
                  <Badge variant="outline" className={tenant.color}>
                    {tenant.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-4">
        <div className="p-2 rounded-full bg-rose-500/10 shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-400">Approaching Rate Limit: Exotel India (Zone A)</h4>
          <p className="text-sm text-slate-400 mt-1">
            Current concurrent outbound calls are at 88% of the provisioned Exotel limit. Consider requesting a limit increase or adjusting the campaign dialer throttle for IIIT Allahabad to prevent dropped calls.
          </p>
        </div>
      </div>
    </div>
  );
}

// Just importing Building2 down here since I missed it in the main import block above!
import { Building2 } from "lucide-react";