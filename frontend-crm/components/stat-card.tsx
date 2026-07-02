// components/stat-card.tsx
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title:    string;
  value:    string | number;
  subtitle?: string;
  icon:     LucideIcon;
  trend?:   { value: number; label: string };
  color?:   'green' | 'blue' | 'amber' | 'slate';
}

const colorMap = {
  green: { bg: 'bg-forest-50', icon: 'bg-forest-100 text-forest-700', text: 'text-forest-700' },
  blue:  { bg: 'bg-blue-50',   icon: 'bg-blue-100  text-blue-700',    text: 'text-blue-700'   },
  amber: { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-700',   text: 'text-amber-700'  },
  slate: { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600',   text: 'text-slate-600'  },
};

export function StatCard({
  title, value, subtitle, icon: Icon, trend, color = 'slate'
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-stone-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', c.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.value >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}