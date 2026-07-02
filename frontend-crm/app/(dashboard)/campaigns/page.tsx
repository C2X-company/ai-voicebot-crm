// app/(dashboard)/campaigns/page.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Plus, Megaphone, Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';
import { Label  } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { campaignsApi } from '@/lib/api';
import { Campaign } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600',
  active:    'bg-forest-100 text-forest-700',
  paused:    'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function CampaignsPage() {
  const { getToken } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [form,      setForm]      = useState({
    name:           '',
    maxDailyDialed: 100,
  });

  const fetchCampaigns = async () => {
    try {
      const data = await campaignsApi.getAll(getToken);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await campaignsApi.create(getToken, {
        name:           form.name,
        collegeId:      'YOUR_COLLEGE_ID', // from user context
        maxDailyDialed: form.maxDailyDialed,
      });
      setOpen(false);
      setForm({ name: '', maxDailyDialed: 100 });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your outbound calling campaigns</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-forest-700 hover:bg-forest-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Campaign cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-16 text-center">
          <div className="w-16 h-16 bg-forest-50 rounded-2xl mx-auto
                          flex items-center justify-center mb-4">
            <Megaphone className="w-7 h-7 text-forest-600" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No campaigns yet</h3>
          <p className="text-slate-400 text-sm mb-4">Create your first campaign to start calling</p>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-forest-700 hover:bg-forest-800 text-white"
          >
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <div key={c._id}
              className="bg-white rounded-2xl border border-stone-100 p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest-50 rounded-xl
                                  flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-forest-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Max {c.maxDailyDialed} calls/day
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-lg',
                  statusColors[c.status]
                )}>
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Total',     value: c.totalLeads  },
                  { label: 'Called',    value: c.called      },
                  { label: 'Qualified', value: c.qualified   },
                ].map(stat => (
                  <div key={stat.label} className="bg-stone-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-500 rounded-full transition-all"
                  style={{ width: `${c.totalLeads ? (c.called / c.totalLeads) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {c.totalLeads ? Math.round((c.called / c.totalLeads) * 100) : 0}% complete
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl bg-white border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-forest-600" />
              New Campaign
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Campaign Name
              </Label>
              <Input
                placeholder="e.g. JEE 2025 Outreach"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="rounded-xl border-stone-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Max Daily Calls
              </Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={form.maxDailyDialed}
                onChange={e => setForm(f => ({ ...f, maxDailyDialed: Number(e.target.value) }))}
                className="rounded-xl border-stone-200"
              />
              <p className="text-xs text-slate-400">Maximum calls fired per day</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border-stone-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!form.name.trim() || creating}
                className="flex-1 rounded-xl bg-forest-700 hover:bg-forest-800 text-white"
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white
                                    rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : 'Create Campaign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}