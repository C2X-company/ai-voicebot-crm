import { BarChart3, TrendingUp, Users, Clock, Phone, Activity } from "lucide-react";
import { getCurrentAdminTenant } from "@/lib/actions/admin";
import { Lead } from "@/lib/models"; 
import { AnalyticsChart } from "@/components/admin/AnalyticsChart"; // 🚨 Path updated to match Step 2

export default async function AnalyticsPage() {
  const tenant = await getCurrentAdminTenant();
  
  if (!tenant) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        No active college tenant configuration found.
      </div>
    );
  }

  const tenantId = tenant.orgId;

  // 1. Total Calls Placed: Where lead status is anything except 'New'
  const totalCalls = await Lead.countDocuments({ tenantId, status: { $ne: 'New' } });

  // 2. Connect Rate Calculation: (Called + Converted) / Total Calls
  const successfullyConnected = await Lead.countDocuments({ 
    tenantId, 
    status: { $in: ['Called', 'Converted'] } 
  });
  const connectRate = totalCalls > 0 ? ((successfullyConnected / totalCalls) * 100).toFixed(1) : "0.0";

  // 3. Average Call Duration Aggregate Calculation
  const durationAggregate = await Lead.aggregate([
    { $match: { tenantId, status: { $ne: 'New' } } },
    { $group: { _id: null, avgDuration: { $avg: "$callDuration" } } }
  ]);
  const avgDurationSeconds = durationAggregate[0]?.avgDuration || 0;
  const minutes = Math.floor(avgDurationSeconds / 60);
  const seconds = Math.round(avgDurationSeconds % 60);
  const avgDurationStr = totalCalls > 0 ? `${minutes}m ${seconds}s` : "0s";

  // 4. Hot Leads Count
  const hotLeads = await Lead.countDocuments({ tenantId, intentScore: 'Hot' });

  // 5. Intent Score Distribution Aggregation
  const totalWithIntent = await Lead.countDocuments({ tenantId, intentScore: { $exists: true, $ne: null } });
  const hotCount = await Lead.countDocuments({ tenantId, intentScore: 'Hot' });
  const warmCount = await Lead.countDocuments({ tenantId, intentScore: 'Warm' });
  const coldCount = await Lead.countDocuments({ tenantId, intentScore: 'Cold' });

  const hotPct = totalWithIntent > 0 ? Math.round((hotCount / totalWithIntent) * 100) : 0;
  const warmPct = totalWithIntent > 0 ? Math.round((warmCount / totalWithIntent) * 100) : 0;
  const coldPct = totalWithIntent > 0 ? Math.round((coldCount / totalWithIntent) * 100) : 0;

  // 6. Chronological 7-Day Call Volume Aggregation
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyCallsAggregate = await Lead.aggregate([
    { 
      $match: { 
        tenantId, 
        status: { $ne: 'New' },
        createdAt: { $gte: sevenDaysAgo }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Normalize chronological array indexes
  const callVolumeData: number[] = [];
  const dayLabels: string[] = [];
  const weekdayOptions: Intl.DateTimeFormatOptions = { weekday: 'short' };

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const match = dailyCallsAggregate.find(item => item._id === dateStr);
    
    callVolumeData.push(match ? match.count : 0);
    dayLabels.push(d.toLocaleDateString('en-US', weekdayOptions));
  }

  // 🚨 Create the clean data array for Recharts
  const chartData = dayLabels.map((day, i) => ({
    day,
    calls: callVolumeData[i]
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Campaign Analytics</h1>
        <p className="text-slate-500 mt-2">Real-time performance metrics for your AI Voice Bot.</p>
      </div>

      {/* Real-time Calculated Metrics Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Calls Placed", value: totalCalls.toLocaleString(), icon: Phone, color: "text-blue-500" },
          { title: "Connect Rate", value: `${connectRate}%`, icon: Activity, color: "text-emerald-500" },
          { title: "Average Duration", value: avgDurationStr, icon: Clock, color: "text-amber-500" },
          { title: "Hot Leads Generated", value: hotLeads.toLocaleString(), icon: Users, color: "text-violet-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                Live Data
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 🚨 THE RECHARTS INTEGRATION 🚨 */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" /> Call Volume (Past 7 Days)
            </h3>
          </div>
          {/* This is the new, smooth, animated chart! */}
          <AnalyticsChart data={chartData} />
        </div>

        {/* Real Lead Qualification Intent Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-slate-400" /> Lead Intent Score
          </h3>
          
          <div className="space-y-6 mt-8">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-amber-700">High Intent (Ready to enroll)</span>
                <span className="text-slate-900">{hotPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${hotPct}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-blue-700">Medium Intent (Gathering Info)</span>
                <span className="text-slate-900">{warmPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${warmPct}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-600">Low Intent (Not interested)</span>
                <span className="text-slate-900">{coldPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-slate-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${coldPct}%` }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}