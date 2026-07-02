// components/admin/admin-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Megaphone, Users2,
  BookOpen, BarChart3, Settings, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  {
    href:  '/admin',
    label: 'Overview',
    icon:  LayoutDashboard,
    exact: true,
    color: 'emerald',
  },
  {
    href:  '/admin/campaigns',
    label: 'Campaigns',
    icon:  Megaphone,
    exact: false,
    color: 'violet',
  },
  {
    href:  '/admin/leads',
    label: 'Leads',
    icon:  Users2,
    exact: false,
    color: 'blue',
  },
  {
    href:  '/admin/knowledge-base',
    label: 'Knowledge Base',
    icon:  BookOpen,
    exact: false,
    color: 'amber',
  },
  {
    href:  '/admin/analytics',
    label: 'Analytics',
    icon:  BarChart3,
    exact: false,
    color: 'rose',
  },
  {
    href:  '/admin/settings',
    label: 'Settings',
    icon:  Settings,
    exact: false,
    color: 'slate',
  },
] as const;

// Per-item color maps
const iconColors: Record<string, { active: string; inactive: string; bg: string }> = {
  emerald: { active: 'text-white', inactive: 'text-emerald-600', bg: 'bg-emerald-500' },
  violet:  { active: 'text-white', inactive: 'text-violet-600',  bg: 'bg-violet-500'  },
  blue:    { active: 'text-white', inactive: 'text-blue-600',    bg: 'bg-blue-500'    },
  amber:   { active: 'text-white', inactive: 'text-amber-600',   bg: 'bg-amber-500'   },
  rose:    { active: 'text-white', inactive: 'text-rose-600',    bg: 'bg-rose-500'    },
  slate:   { active: 'text-white', inactive: 'text-slate-500',   bg: 'bg-slate-400'   },
};

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-3 overflow-y-auto">
      <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Navigation
      </p>
      <div className="space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact, color }) => {
          const isActive   = exact ? pathname === href : pathname.startsWith(href);
          const colorClass = iconColors[color];

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
                'font-medium transition-all duration-150',
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              {/* Coloured icon box */}
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                isActive
                  ? colorClass.bg + ' shadow-sm'
                  : 'bg-slate-100 group-hover:bg-slate-200'
              )}>
                <Icon className={cn(
                  'w-3.5 h-3.5 transition-colors',
                  isActive ? colorClass.active : colorClass.inactive
                )} />
              </div>

              <span className="flex-1 leading-none">{label}</span>

              {isActive && (
                <div className={cn('w-1 h-4 rounded-full flex-shrink-0', colorClass.bg)} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}