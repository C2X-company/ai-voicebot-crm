// app/(agent)/agent/page.tsx
'use client';

import { useState } from 'react';
import {
  Phone, PhoneOff, PhoneForwarded,
  User, MapPin, BookOpen, Mic, MicOff,
  Star, ThumbsUp, ThumbsDown, Calendar,
  ChevronRight, AlertCircle, Clock,
  MoreVertical, Flame, MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Mock data ──────────────────────────────────────────────────────────────
const LEAD_QUEUE = [
  {
    id:        1,
    name:      'Rahul Sharma',
    rank:      14320,
    city:      'Lucknow, UP',
    branch:    'CSE',
    score:     94,
    priority:  'hot',
    concern:   'Comparing with NIT Trichy',
    lastCall:  null,
    phone:     '+91 98765 43210',
  },
  {
    id:        2,
    name:      'Priya Nair',
    rank:      22810,
    city:      'Kochi, KL',
    branch:    'IT',
    score:     78,
    priority:  'warm',
    concern:   'Wants hostel confirmation',
    lastCall:  'Voicemail — 20 min ago',
    phone:     '+91 94432 11098',
  },
  {
    id:        3,
    name:      'Arjun Mishra',
    rank:      9450,
    city:      'Bhopal, MP',
    branch:    'CSE',
    score:     89,
    priority:  'hot',
    concern:   'Scholarship eligibility query',
    lastCall:  null,
    phone:     '+91 88001 23456',
  },
  {
    id:        4,
    name:      'Sneha Verma',
    rank:      31200,
    city:      'Agra, UP',
    branch:    'ECE',
    score:     62,
    priority:  'warm',
    concern:   'Fee payment timeline',
    lastCall:  'Not Connected — 25 min ago',
    phone:     '+91 70011 55432',
  },
  {
    id:        5,
    name:      'Kunal Joshi',
    rank:      18640,
    city:      'Pune, MH',
    branch:    'IT',
    score:     81,
    priority:  'warm',
    concern:   'Placement package queries',
    lastCall:  'Interested — 30 min ago',
    phone:     '+91 91234 56789',
  },
];

const MOCK_TRANSCRIPT = [
  {
    role:    'bot',
    text:    'Hello Rahul ji! Main IIIT Allahabad ke admissions office se bol rahi hoon. Kya aap abhi baat kar sakte hain?',
    time:    '2:34 PM',
  },
  {
    role:    'student',
    text:    "Haan, bol sakte hain. Main JEE Advanced result ke baad hi tha, sooch raha tha IIIT ke baare mein.",
    time:    '2:34 PM',
  },
  {
    role:    'bot',
    text:    'Bahut achha! Aapka rank 14,320 hai — CSE branch mein admission possible hai. Kya main aapko cutoff aur placements ke baare mein bataaun?',
    time:    '2:35 PM',
  },
  {
    role:    'student',
    text:    "Haan zaroor. Aur ek cheez — NIT Trichy se compare karoon toh kya better hoga?",
    time:    '2:35 PM',
  },
  {
    role:    'bot',
    text:    'Great question! IIIT Allahabad ka CSE placement average ₹18 LPA hai, highest ₹1.2 crore. NIT Trichy se comparison mein…',
    time:    '2:36 PM',
  },
];

const priorityConfig = {
  hot:  { bg: 'bg-red-50',   text: 'text-red-600',   border: 'border-red-200',   icon: Flame,         label: 'Hot'  },
  warm: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Star,          label: 'Warm' },
  cold: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: MessageSquare, label: 'Cold' },
};

type LeadType = typeof LEAD_QUEUE[0];

export default function AgentPage() {
  const [activeLead, setActiveLead] = useState<LeadType>(LEAD_QUEUE[0]);
  const [muted,      setMuted]      = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [note,       setNote]       = useState('');

  const p = priorityConfig[activeLead.priority as keyof typeof priorityConfig];

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Lead Queue ──────────────────────────────────────────── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">

        {/* Queue header */}
        <div className="px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Live Queue</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {LEAD_QUEUE.length} leads · sorted by score
              </p>
            </div>
            <span className="w-6 h-6 rounded-full bg-red-500 text-white text-[11px]
                             font-bold flex items-center justify-center animate-pulse">
              {LEAD_QUEUE.filter(l => l.priority === 'hot').length}
            </span>
          </div>
        </div>

        {/* Lead list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {LEAD_QUEUE.map((lead) => {
            const cfg      = priorityConfig[lead.priority as keyof typeof priorityConfig];
            const PrioIcon = cfg.icon;
            const isActive = lead.id === activeLead.id;

            return (
              <button
                key={lead.id}
                onClick={() => setActiveLead(lead)}
                className={cn(
                  'w-full text-left px-4 py-3.5 transition-colors',
                  isActive
                    ? 'bg-blue-50 border-l-2 border-l-blue-500'
                    : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Score ring */}
                  <div className="flex-shrink-0 relative">
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center',
                      isActive ? 'bg-blue-100' : 'bg-slate-100'
                    )}>
                      <span className={cn(
                        'text-xs font-bold',
                        isActive ? 'text-blue-700' : 'text-slate-600'
                      )}>
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                                    flex items-center justify-center ${cfg.bg} border border-white`}>
                      <PrioIcon className={`w-2 h-2 ${cfg.text}`} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800 leading-none">
                        {lead.name}
                      </span>
                      <span className={cn(
                        'text-[11px] font-bold',
                        lead.score >= 85 ? 'text-emerald-600' :
                        lead.score >= 70 ? 'text-amber-600'   : 'text-slate-400'
                      )}>
                        {lead.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-400">{lead.branch}</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-[11px] text-slate-400 truncate">{lead.city}</span>
                    </div>
                    {lead.lastCall && (
                      <p className="text-[10px] text-blue-500 mt-1 truncate">{lead.lastCall}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Active Call Workspace ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

        {/* Workspace header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4
                        bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center shadow-sm shadow-blue-200">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{activeLead.name}</h2>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                                 font-bold border ${p.bg} ${p.text} ${p.border}`}>
                  <p.icon className="w-2.5 h-2.5" />
                  {p.label}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400">JEE Rank #{activeLead.rank.toLocaleString()}</span>
                <span className="text-slate-200">·</span>
                <span className="text-[11px] text-slate-400">{activeLead.branch}</span>
                <span className="text-slate-200">·</span>
                <span className="text-[11px] text-slate-400">{activeLead.phone}</span>
              </div>
            </div>
          </div>

          {/* Call controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                muted
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              )}
            >
              {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {muted ? 'Unmute' : 'Mute'}
            </button>

            <button
              onClick={() => setCallActive(!callActive)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm',
                callActive
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
              )}
            >
              {callActive
                ? <><PhoneOff className="w-4 h-4" /> End Call</>
                : <><Phone className="w-4 h-4" /> Call Now</>
              }
            </button>
          </div>
        </div>

        {/* Main workspace split */}
        <div className="flex-1 overflow-hidden flex gap-0">

          {/* Context brief */}
          <div className="w-72 flex-shrink-0 p-4 overflow-y-auto border-r border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Pre-Call Brief
            </h3>

            {/* Concern */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                    Key Concern
                  </p>
                  <p className="text-xs text-amber-800 mt-1">{activeLead.concern}</p>
                </div>
              </div>
            </div>

            {/* Student details */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
              {[
                { icon: MapPin,    label: 'Location', value: activeLead.city    },
                { icon: BookOpen,  label: 'Branch',   value: activeLead.branch  },
                { icon: Star,      label: 'Int. Score',value: `${activeLead.score}/100` },
                { icon: Clock,     label: 'JEE Rank', value: `#${activeLead.rank.toLocaleString()}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 leading-none">{label}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick facts */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">
                Quick Facts
              </p>
              {[
                'CSE cutoff 2024: 13,450 rank',
                'Avg placement: ₹18 LPA',
                'Highest offer: ₹1.2 crore',
                'Hostel: ₹72,000/yr',
                'Total fees: ₹1.3L/yr',
              ].map(fact => (
                <div key={fact} className="flex items-start gap-1.5 mb-1.5">
                  <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-blue-800">{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript + Disposition */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Live transcript */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  AI Call Transcript
                </h3>
                {callActive && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>

              {MOCK_TRANSCRIPT.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'student' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold',
                    msg.role === 'bot'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-200 text-slate-600'
                  )}>
                    {msg.role === 'bot' ? 'AI' : 'RS'}
                  </div>
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    msg.role === 'bot'
                      ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  )}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={cn(
                      'text-[10px] mt-1',
                      msg.role === 'bot' ? 'text-slate-400' : 'text-blue-200'
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {callActive && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600
                                  flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disposition bar */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
                Post-Call Disposition
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: 'Enrolled',        icon: ThumbsUp,        bg: 'bg-emerald-50  hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
                  { label: 'Very Interested', icon: Flame,           bg: 'bg-orange-50   hover:bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-200'  },
                  { label: 'Schedule Callback', icon: Calendar,      bg: 'bg-blue-50     hover:bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200'    },
                  { label: 'Not Interested',  icon: ThumbsDown,      bg: 'bg-slate-50    hover:bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200'   },
                  { label: 'Transfer',        icon: PhoneForwarded,  bg: 'bg-violet-50   hover:bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200'  },
                ].map(({ label, icon: Icon, bg, text, border }) => (
                  <button
                    key={label}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold',
                      'border transition-colors', bg, text, border
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Note field */}
              <div className="mt-3">
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add internal note about this call…"
                  rows={2}
                  className="w-full text-sm text-slate-700 placeholder:text-slate-400
                             bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}