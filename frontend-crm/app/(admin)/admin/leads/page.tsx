"use client";

import { useState, useEffect } from "react";
import { Search, Filter, PhoneCall, MoreVertical, Calendar, Clock, Brain, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🚨 IMPORT THE NEW SERVER ACTION
import { getAllAdminLeads } from "@/lib/actions/admin";

// Define the shape of our Lead data
interface LeadData {
  _id: string;
  name: string;
  phone: string;
  course?: string;
  status: string;
  intentScore?: 'Hot' | 'Warm' | 'Cold';
  callDuration?: number;
  transcript?: string;
  summary?: string;
  recordingUrl?: string; 
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🚨 THE FIX: Use the Server Action directly instead of the broken API route
  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getAllAdminLeads();
        setLeads(data || []);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Helper to format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Helper to format dates securely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-10 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-slate-500 mt-2">View and manage all student inquiries processed by the AI Voice Bot.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Export to CSV
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Button variant="outline" className="text-slate-600">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium">Student Info</th>
                <th className="p-4 font-medium">Program Interest</th>
                <th className="p-4 font-medium">AI Call Details</th>
                <th className="p-4 font-medium">Intent Score</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading leads data...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No leads found. Upload a CSV to get started.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead._id} 
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{lead.name || "Unknown Lead"}</p>
                      <p className="text-sm text-slate-500">{lead.phone}</p>
                    </td>
                    <td className="p-4 text-slate-700 text-sm font-medium">
                      {lead.course || "General Inquiry"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <PhoneCall className="w-3 h-3 text-emerald-500" /> 
                        {lead.status === 'Called' || lead.status === 'Converted' ? formatDuration(lead.callDuration) : 'Pending Call'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" /> {formatDate(lead.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        lead.status === 'Converted' || lead.intentScore === 'Hot' ? 'bg-amber-100 text-amber-700' :
                        lead.intentScore === 'Warm' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'New' ? 'bg-slate-100 text-slate-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.status === 'New' ? 'Not Called' : (lead.intentScore || lead.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for Call Details */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
          {/* Click away overlay */}
          <div className="absolute inset-0" onClick={() => setSelectedLead(null)}></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
                <p className="text-sm text-slate-500 font-medium">{selectedLead.phone}</p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)} 
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-6 pb-2 grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" /> Call Duration
                </div>
                <span className="text-lg font-bold text-slate-900">{formatDuration(selectedLead.callDuration)}</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Intent Score</div>
                <span className={`text-lg font-bold ${
                  selectedLead.intentScore === 'Hot' ? 'text-amber-600' :
                  selectedLead.intentScore === 'Warm' ? 'text-blue-600' : 'text-slate-700'
                }`}>
                  {selectedLead.intentScore || 'Unscored'}
                </span>
              </div>
            </div>

            {/* Audio Player Block */}
            {selectedLead.recordingUrl && (
              <div className="px-6 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                  </svg>
                  Call Recording
                </div>
                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 shadow-inner">
                  <audio 
                    src={selectedLead.recordingUrl} 
                    controls 
                    className="w-full h-10" 
                  />
                </div>
              </div>
            )}

            {/* Scrollable Content (Summary & Transcript) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Summary Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-violet-500" /> AI Conversation Summary
                </h3>
                <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl text-sm text-slate-700 leading-relaxed">
                  {selectedLead.summary ? selectedLead.summary : <span className="italic text-slate-400">No summary generated by Vapi for this call.</span>}
                </div>
              </section>

              {/* Transcript Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-blue-500" /> Full Transcript Log
                </h3>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedLead.transcript ? selectedLead.transcript : <span className="italic text-slate-400 font-sans">Transcript will appear here once the call connects and finishes.</span>}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}