// app/(superadmin)/layout.tsx
import { requireSuperadmin } from '@/lib/auth';
import { UserButton } from '@clerk/nextjs';
import { SuperadminNav } from '@/components/superadmin/superadmin-nav';
import {
  Layers, Bell, Cpu, Zap,
  ChevronDown, Circle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | Superadmin', default: 'Platform Console' }
};

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperadmin();

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">

      {/* ── Dark Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col bg-slate-950
                        border-r border-slate-800/60">

        {/* Logotype */}
        <div className="flex items-center gap-3 h-14 px-4
                        border-b border-slate-800/60 flex-shrink-0">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700
                            flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                             bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none tracking-tight">
              VoiceBot
            </p>
            <p className="text-violet-400 text-[10px] font-medium mt-0.5 tracking-wide">
              PLATFORM ADMIN
            </p>
          </div>
        </div>

        {/* Navigation */}
        <SuperadminNav />

        {/* Bottom — System Status + User */}
        <div className="flex-shrink-0 p-3 border-t border-slate-800/60 space-y-2">

          {/* System status card */}
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  System
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-400">Nominal</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Vapi AI',   status: 'up' },
                { label: 'Exotel',   status: 'up' },
                { label: 'Pinecone', status: 'up' },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{label}</span>
                  <span className={cn(
                    'text-[10px] font-medium',
                    status === 'up' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {status === 'up' ? '● UP' : '● DOWN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User row */}
          <div className="flex items-center gap-2.5 px-1 py-1">
            <UserButton
              appearance={{
                elements: {
                  avatarBox:      'w-7 h-7',
                  userButtonPopoverCard: 'shadow-2xl',
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-300 leading-none truncate">
                Platform Admin
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">superadmin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Sticky Header — glassmorphism on dark */}
        <header className="flex-shrink-0 flex items-center justify-between h-14 px-6
                           border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md
                           sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-slate-200">
                Platform Console
              </span>
            </div>
            <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/25
                              text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide">
              SUPERADMIN
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Live pulse */}
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60
                            rounded-xl px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-400">18 tenants live</span>
            </div>

            <button className="relative p-2.5 rounded-xl text-slate-500
                               hover:text-slate-300 hover:bg-slate-800/60 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          <div className="p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// tiny helper — not from lib/utils to keep layout self-contained
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}