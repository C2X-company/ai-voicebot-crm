// components/agent/agent-sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, PhoneIncoming, PhoneCall,
  CalendarCheck, ChevronLeft, ChevronRight,
  Radio
} from 'lucide-react';

const NAV_ITEMS = [
  {
    href:  '/agent',
    label: 'Overview',
    icon:  LayoutDashboard,
    exact: true,
    badge: null,
  },
  {
    href:  '/agent/inbox',
    label: 'Live Queue',
    icon:  PhoneIncoming,
    exact: false,
    badge: '7',
  },
  {
    href:  '/agent/post-call',
    label: 'Post-Call',
    icon:  PhoneCall,
    exact: false,
    badge: '3',
  },
  {
    href:  '/agent/schedule',
    label: 'Scheduled',
    icon:  CalendarCheck,
    exact: false,
    badge: null,
  },
] as const;

interface AgentSidebarProps {
  collegeName?: string;
}

export function AgentSidebar({ collegeName }: AgentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname                  = usePathname();

  return (
    <aside
      className={cn(
        'flex-shrink-0 bg-white border-r border-slate-200/80',
        'flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[200px]'
      )}
    >
      {/* Logo row + collapse toggle */}
      <div className={cn(
        'flex items-center h-14 border-b border-slate-100 flex-shrink-0',
        collapsed ? 'justify-center px-0' : 'justify-between px-4'
      )}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          {/* Icon always visible */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600
                          flex items-center justify-center flex-shrink-0
                          shadow-sm shadow-blue-200">
            <Radio className="w-3.5 h-3.5 text-white" />
          </div>
          {/* Label hidden when collapsed */}
          {!collapsed && (
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">VoiceBot</p>
              <p className="text-[10px] text-blue-500 font-semibold mt-0.5">AGENT</p>
            </div>
          )}
        </div>

        {/* Collapse / expand button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500
                       hover:bg-slate-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expand button — shown only when collapsed */}
      {collapsed && (
        <div className="flex justify-center pt-2 flex-shrink-0">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500
                       hover:bg-slate-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        'flex-1 py-3 overflow-y-auto',
        collapsed ? 'px-2 space-y-1' : 'px-3 space-y-0.5'
      )}>
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Workspace
          </p>
        )}

        {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          /* Collapsed — icon only with tooltip title */
          if (collapsed) {
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  'relative flex items-center justify-center w-full h-9 rounded-xl transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {badge && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full
                                   bg-blue-500 text-white text-[9px] font-bold
                                   flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          }

          /* Expanded — full label */
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
                'font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                isActive
                  ? 'bg-blue-600 shadow-sm shadow-blue-200'
                  : 'bg-slate-100 group-hover:bg-slate-200'
              )}>
                <Icon className={cn(
                  'w-3.5 h-3.5',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                )} />
              </div>
              <span className="flex-1 leading-none">{label}</span>
              {badge && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status indicator at bottom */}
      {!collapsed && (
        <div className="flex-shrink-0 p-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl
                          border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-700">Available</span>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="flex-shrink-0 p-2 border-t border-slate-100">
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Available" />
          </div>
        </div>
      )}
    </aside>
  );
}