// components/superadmin/superadmin-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid, Building2, KeyRound,
  CreditCard, ShieldCheck, Settings, Gauge
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Platform',
    items: [
      { href: '/superadmin',            label: 'Overview',    icon: LayoutGrid,   exact: true  },
      { href: '/superadmin/tenants',    label: 'Tenants',     icon: Building2,    exact: false },
      { href: '/superadmin/api-keys',   label: 'API Keys',    icon: KeyRound,     exact: false },
    ]
  },
  {
    label: 'Management',
    items: [
      { href: '/superadmin/billing',    label: 'Billing',     icon: CreditCard,   exact: false },
      { href: '/superadmin/compliance', label: 'Compliance',  icon: ShieldCheck,  exact: false },
      { href: '/superadmin/usage',      label: 'Usage',       icon: Gauge,        exact: false },
      { href: '/superadmin/settings',   label: 'Settings',    icon: Settings,     exact: false },
    ]
  }
];

export function SuperadminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      {NAV_SECTIONS.map(({ label, items }) => (
        <div key={label}>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            {label}
          </p>
          <div className="space-y-0.5">
            {items.map(({ href, label: itemLabel, icon: Icon, exact }) => {
              const isActive = exact
                ? pathname === href
                : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
                    'font-medium transition-all duration-150',
                    isActive
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                    isActive
                      ? 'bg-violet-500/30'
                      : 'group-hover:bg-slate-700/60'
                  )}>
                    <Icon className={cn(
                      'w-3.5 h-3.5 transition-colors',
                      isActive ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-300'
                    )} />
                  </div>
                  <span className="flex-1 leading-none">{itemLabel}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}