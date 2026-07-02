// app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Users, PhoneCall, Star, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { leadsApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const statusColors: Record<string, string> = {
  qualified:      '#438575',
  pending:        '#94a3b8',
  calling:        '#60a5fa',
  no_answer:      '#f59e0b',
  not_interested: '#f87171',
  transferred:    '#a78bfa',
  enrolled:       '#34d399',
  dnd:            '#cbd5e1',
};

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await leadsApi.getStats(getToken);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getToken]);

  const chartData = stats
    ? Object.entries(stats.byStatus).map(([name, value]) => ({
        name:  name.replace('_', ' '),
        value: value as number,
        fill:  statusColors[name] || '#94a3b8',
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-stone-100" />
          ))}
        </div>
      </div>
    );
  }

  const total      = stats?.total || 0;
  const called     = (stats?.byStatus?.qualified || 0) + (stats?.byStatus?.not_interested || 0);
  const qualified  = stats?.byStatus?.qualified  || 0;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your calling campaigns</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Leads"
          value={total.toLocaleString()}
          subtitle="Across all campaigns"
          icon={Users}
          color="slate"
        />
        <StatCard
          title="Called"
          value={called.toLocaleString()}
          subtitle="Calls completed"
          icon={PhoneCall}
          color="blue"
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatCard
          title="Qualified"
          value={qualified.toLocaleString()}
          subtitle="AI-identified interested leads"
          icon={Star}
          color="green"
          trend={{ value: 8, label: 'vs last week' }}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-stone-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-800">Lead Status Breakdown</h2>
            <p className="text-sm text-slate-400 mt-0.5">Distribution across all statuses</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-forest-700 bg-forest-50
                          px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            <span>Live data</span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={36}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  background:   '#fff',
                  border:       '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow:    '0 4px 6px rgba(0,0,0,0.05)',
                  fontSize:     13,
                }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            No data yet — run your first campaign
          </div>
        )}
      </div>

      {/* Intent breakdown */}
      {stats?.byIntent && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'hot',  label: 'Hot Leads',  color: 'bg-red-100  text-red-700'   },
            { key: 'warm', label: 'Warm Leads', color: 'bg-amber-100 text-amber-700' },
            { key: 'cold', label: 'Cold Leads', color: 'bg-blue-100 text-blue-700'   },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-white rounded-2xl p-5 shadow-card border border-stone-100">
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${color} mb-3`}>
                {label}
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {stats.byIntent[key] || 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}