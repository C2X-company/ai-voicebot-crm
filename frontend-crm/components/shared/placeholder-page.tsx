// components/shared/placeholder-page.tsx
import Link from 'next/link';
import {
  type LucideIcon,
  ArrowLeft,
  Construction,
  Clock,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface PlaceholderPageProps {
  title:        string;
  description:  string;
  icon?:        LucideIcon;
  backHref?:    string;
  backLabel?:   string;
  eta?:         string;
  features?:    string[];
  accent?:      'violet' | 'emerald' | 'blue' | 'amber' | 'rose';
}

// ── Per-accent Tailwind class maps ─────────────────────────────────────────
// Classes are written in full so Tailwind's static scanner can detect them.
const ACCENT = {
  violet: {
    badge:     'bg-violet-50  text-violet-700  border-violet-200',
    glow:      'bg-violet-400/25',
    iconWrap:  'bg-violet-50  border-violet-100/80',
    icon:      'text-violet-600',
    bullet:    'text-violet-400',
    ring:      'ring-violet-100',
  },
  emerald: {
    badge:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    glow:      'bg-emerald-400/25',
    iconWrap:  'bg-emerald-50 border-emerald-100/80',
    icon:      'text-emerald-600',
    bullet:    'text-emerald-400',
    ring:      'ring-emerald-100',
  },
  blue: {
    badge:     'bg-blue-50    text-blue-700    border-blue-200',
    glow:      'bg-blue-400/25',
    iconWrap:  'bg-blue-50    border-blue-100/80',
    icon:      'text-blue-600',
    bullet:    'text-blue-400',
    ring:      'ring-blue-100',
  },
  amber: {
    badge:     'bg-amber-50   text-amber-700   border-amber-200',
    glow:      'bg-amber-400/25',
    iconWrap:  'bg-amber-50   border-amber-100/80',
    icon:      'text-amber-600',
    bullet:    'text-amber-400',
    ring:      'ring-amber-100',
  },
  rose: {
    badge:     'bg-rose-50    text-rose-700    border-rose-200',
    glow:      'bg-rose-400/25',
    iconWrap:  'bg-rose-50    border-rose-100/80',
    icon:      'text-rose-600',
    bullet:    'text-rose-400',
    ring:      'ring-rose-100',
  },
} satisfies Record<string, Record<string, string>>;

// ── Component ──────────────────────────────────────────────────────────────
export function PlaceholderPage({
  title,
  description,
  icon:      Icon      = Construction,
  backHref             = '/',
  backLabel            = 'Return to Dashboard',
  eta                  = 'Coming Soon',
  features,
  accent               = 'violet',
}: PlaceholderPageProps) {
  const c = ACCENT[accent];

  return (
    /*
     * Fills the parent's remaining height.
     * The outer <main> in each layout provides the scroll context.
     */
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* ── Dashed card ──────────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl border-2 border-dashed border-stone-200
                     overflow-hidden px-8 py-10 text-center"
          style={{
            /* Subtle dot grid — gives depth without noise */
            backgroundImage:
              'radial-gradient(circle, #d1d5db 0.75px, transparent 0.75px)',
            backgroundSize: '18px 18px',
          }}
        >
          {/* Frosted overlay to soften the grid */}
          <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-[1px] rounded-3xl
                          pointer-events-none" />

          {/* ── Inner content (z-10 lifts above overlay) ──────────────── */}
          <div className="relative z-10 flex flex-col items-center gap-0">

            {/* Status badge */}
            <div className={cn(
              'inline-flex items-center gap-1.5',
              'px-3 py-1 mb-7 rounded-full text-xs font-semibold border',
              c.badge
            )}>
              <Clock className="w-3 h-3" />
              {eta}
            </div>

            {/* Icon with glow */}
            <div className="relative mb-6">
              {/* Colour glow layer */}
              <div
                className={cn(
                  'absolute inset-0 rounded-[28px] blur-2xl',
                  'scale-[2] opacity-60',
                  c.glow
                )}
                aria-hidden
              />

              {/* Icon container */}
              <div
                className={cn(
                  'relative w-20 h-20 rounded-[22px] border',
                  'flex items-center justify-center',
                  'shadow-sm ring-4',
                  c.iconWrap,
                  c.ring
                )}
              >
                <Icon className={cn('w-9 h-9', c.icon)} strokeWidth={1.75} />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
              {title}
            </h1>

            {/* Sub-description */}
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              {description}
            </p>

            {/* Optional: planned features list */}
            {features && features.length > 0 && (
              <div
                className="mt-7 w-full rounded-2xl border border-stone-200/80
                           bg-white/60 px-4 py-4 text-left
                           backdrop-blur-sm"
              >
                <p className="text-[10px] font-bold text-slate-400
                               uppercase tracking-[0.14em] mb-3">
                  Planned for this module
                </p>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Circle
                        className={cn('w-2.5 h-2.5 flex-shrink-0 mt-0.5', c.bullet)}
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-slate-600 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <Button
              asChild
              variant="outline"
              className="mt-8 rounded-xl border-stone-200 text-slate-600
                         hover:text-slate-900 hover:bg-stone-50 gap-2"
            >
              <Link href={backHref}>
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Link>
            </Button>

          </div>
        </div>

        {/* Tiny hint below the card */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          This module is actively under development.
          Core functionality will be available in an upcoming sprint.
        </p>

      </div>
    </div>
  );
}