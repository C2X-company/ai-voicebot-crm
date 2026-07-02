// components/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Megaphone, Users, Settings, PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns',  icon: Megaphone        },
  { href: '/leads',     label: 'Leads',      icon: Users            },
  { href: '/settings',  label: 'Settings',   icon: Settings         },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-white border-r border-stone-200
                      flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-none">VoiceBot</p>
            <p className="text-xs text-slate-400 mt-0.5">CRM Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider
                      px-3 py-2 mt-1">
          Main Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
                'transition-all duration-150',
                isActive
                  ? 'bg-forest-50 text-forest-700 font-medium border border-forest-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-stone-50'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                isActive ? 'text-forest-600' : 'text-slate-400'
              )} />
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-stone-100">
        <div className="bg-forest-50 rounded-xl p-3">
          <p className="text-xs font-medium text-forest-700">System Status</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500">All systems running</span>
          </div>
        </div>
      </div>
    </aside>
  );
}