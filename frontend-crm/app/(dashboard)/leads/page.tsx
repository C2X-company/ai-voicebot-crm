// app/(dashboard)/leads/page.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';
import {
  Search, Upload, RefreshCw, Filter,
  Phone, MapPin, Star, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';
import { Badge  } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CSVUploadModal } from '@/components/csv-upload-modal';
import { leadsApi, campaignsApi } from '@/lib/api';
import { Lead, Campaign } from '@/types';
import { cn } from '@/lib/utils';

// ── Status badge config ──────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; class: string }> = {
  pending:        { label: 'Pending',        class: 'bg-slate-100  text-slate-600'  },
  calling:        { label: 'Calling',        class: 'bg-blue-100   text-blue-700'   },
  qualified:      { label: 'Qualified',      class: 'bg-forest-100 text-forest-700' },
  not_interested: { label: 'Not Interested', class: 'bg-red-50     text-red-600'    },
  no_answer:      { label: 'No Answer',      class: 'bg-amber-100  text-amber-700'  },
  transferred:    { label: 'Transferred',    class: 'bg-purple-100 text-purple-700' },
  enrolled:       { label: 'Enrolled',       class: 'bg-green-100  text-green-700'  },
  dnd:            { label: 'DND',            class: 'bg-gray-100   text-gray-600'   },
};

const intentDots: Record<string, string> = {
  hot:     'bg-red-500',
  warm:    'bg-amber-500',
  cold:    'bg-blue-400',
  unknown: 'bg-slate-300',
};

const FILTERS = [
  { key: '',               label: 'All'          },
  { key: 'qualified',      label: 'Qualified'    },
  { key: 'pending',        label: 'Pending'      },
  { key: 'no_answer',      label: 'No Answer'    },
  { key: 'not_interested', label: 'Not Interested'},
  { key: 'enrolled',       label: 'Enrolled'     },
];

export default function LeadsPage() {
  const { getToken } = useAuth();

  const [leads,      setLeads]      = useState<Lead[]>([]);
  const [campaigns,  setCampaigns]  = useState<Campaign[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('');
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [uploadOpen, setUploadOpen] = useState(false);

  // ── Fetch leads ─────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leadsApi.getAll(getToken, {
        status: filter || undefined,
        page,
        limit: 15,
      });
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, filter, page]);

  // ── Fetch campaigns (for upload modal) ──────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await campaignsApi.getAll(getToken);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [getToken]);

  useEffect(() => { fetchLeads();    }, [fetchLeads]);
  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // ── Client-side search filter ────────────────────────────────────────────
  const visible = leads.filter(l =>
    !search ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search) ||
    l.city?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Update lead status ───────────────────────────────────────────────────
  const handleStatusUpdate = async (leadId: string, status: string) => {
    try {
      await leadsApi.updateStatus(getToken, leadId, status);
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.total.toLocaleString()} total leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeads}
            className="rounded-xl border-stone-200 text-slate-600"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="rounded-xl bg-forest-700 hover:bg-forest-800 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 bg-white rounded-xl
                        border border-stone-200 p-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === f.key
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-stone-50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search name, phone, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-stone-200 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/70 hover:bg-stone-50/70">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-6">
                Student
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Phone
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                City
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                JEE Rank
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Intent
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Attempts
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-stone-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
                      <Filter className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm">
                      {search || filter ? 'No leads match your filters' : 'No leads yet — upload a CSV to get started'}
                    </p>
                    {!search && !filter && (
                      <Button
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                        className="rounded-xl bg-forest-700 hover:bg-forest-800 text-white mt-1"
                      >
                        Upload CSV
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visible.map(lead => {
                const status = statusConfig[lead.status] || statusConfig.pending;
                return (
                  <TableRow
                    key={lead._id}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    {/* Name */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-forest-100 rounded-xl
                                        flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-forest-700">
                            {lead.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm leading-none">
                            {lead.name}
                          </p>
                          {lead.branchInterest && (
                            <p className="text-xs text-slate-400 mt-0.5">{lead.branchInterest}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.phone}
                      </div>
                    </TableCell>

                    {/* City */}
                    <TableCell>
                      {lead.city ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {lead.city}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* JEE Rank */}
                    <TableCell>
                      {lead.jeeRank ? (
                        <span className="text-sm font-mono text-slate-700">
                          {lead.jeeRank.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Intent */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          intentDots[lead.intent] || intentDots.unknown
                        )} />
                        <span className="text-sm text-slate-600 capitalize">
                          {lead.intent}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span className={cn(
                        'inline-flex px-2.5 py-1 rounded-lg text-xs font-medium',
                        status.class
                      )}>
                        {status.label}
                      </span>
                    </TableCell>

                    {/* Attempts */}
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {lead.attempts || 0}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border-stone-200 shadow-lg"
                        >
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(lead._id, 'enrolled')}
                            className="text-sm rounded-lg cursor-pointer"
                          >
                            <Star className="w-4 h-4 mr-2 text-forest-600" />
                            Mark as Enrolled
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(lead._id, 'not_interested')}
                            className="text-sm rounded-lg cursor-pointer text-red-600"
                          >
                            Mark Not Interested
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4
                          border-t border-stone-100">
            <p className="text-sm text-slate-400">
              Page {page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border-stone-200"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="rounded-xl border-stone-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        campaigns={campaigns}
        collegeId="YOUR_COLLEGE_ID"   // replace with user's college from auth context
        onSuccess={() => {
          setUploadOpen(false);
          fetchLeads();
        }}
      />
    </div>
  );
}