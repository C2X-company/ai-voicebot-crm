// app/(agent)/layout.tsx
import { requireAgent } from '@/lib/auth';
import { UserButton } from '@clerk/nextjs';
import { AgentSidebar } from '@/components/agent/agent-sidebar';
import {
  Bell, Wifi, PhoneCall, Clock
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | Agent Workspace', default: 'Agent Workspace' }
};

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAgent();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Collapsible sidebar — client component */}
      <AgentSidebar collegeName={user.collegeName} />

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Agent header */}
        <header className="flex-shrink-0 flex items-center justify-between h-14 px-5
                           border-b border-slate-200/80 bg-white/80 backdrop-blur-md
                           sticky top-0 z-30">

          {/* Left — Status row */}
          <div className="flex items-center gap-3">
            {/* Availability toggle */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50
                               border border-emerald-200 rounded-xl
                               hover:border-emerald-300 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Available</span>
            </button>

            {/* Line status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">Line Active</span>
            </div>

            {/* Queue counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50
                            border border-blue-100 rounded-lg">
              <PhoneCall className="w-3 h-3 text-blue-500" />
              <span className="text-[11px] font-bold text-blue-700">7 in queue</span>
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2">
            {/* Shift timer */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400
                            bg-slate-100 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono font-medium">04:23:11</span>
              <span className="text-slate-300">shift</span>
            </div>

            <button className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-600
                               hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>

            <UserButton
              appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
            />
          </div>
        </header>

        {/* Page — full height, no padding (agent workspace uses full canvas) */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}