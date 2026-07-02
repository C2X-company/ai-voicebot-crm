// app/page.tsx
import { auth }     from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link         from 'next/link';
import {
  Radio, Database, ShieldCheck, BrainCircuit,
  PhoneForwarded, TrendingUp, ArrowRight,
  CheckCircle2, Layers, Sparkles, Quote,
  ChevronRight, PhoneCall, Users2, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserPublicMetadata, UserRole } from '@/types/auth';
import { ROLE_HOME }                          from '@/types/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Static content
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '2,000+', label: 'Concurrent AI calls'        },
  { value: '₹700',   label: 'Avg. cost per qualified lead' },
  { value: '18.4%',  label: 'Average conversion rate'      },
  { value: '24 / 7', label: 'Non-stop calling coverage'    },
];

const FEATURES = [
  {
    icon:  Radio,
    color: 'emerald',
    title: 'Hinglish Voice AI',
    desc:  'Powered by Sarvam AI — code-switches mid-sentence, pronounces "Krishnaswamy" and "Bengaluru" correctly, and mirrors the student\'s language in real time.',
  },
  {
    icon:  Database,
    color: 'teal',
    title: 'RAG Knowledge Base',
    desc:  'Upload your NIRF reports, fee charts, and brochures. The AI answers every question from your exact data — zero hallucinations, zero wrong fees quoted.',
  },
  {
    icon:  ShieldCheck,
    color: 'emerald',
    title: 'TRAI / DND Compliance',
    desc:  'Every lead list is auto-scrubbed against the national DNC registry. 140-series headers, 9 AM–9 PM windows, and opt-out logging are handled by default.',
  },
  {
    icon:  BrainCircuit,
    color: 'teal',
    title: 'Live AI Transcripts',
    desc:  'Counsellors watch the live conversation as it happens. Every call is stored with intent scores, audio recordings, and automatic hot / warm / cold tagging.',
  },
  {
    icon:  PhoneForwarded,
    color: 'emerald',
    title: 'Warm Handoff Engine',
    desc:  'When a student says "I want to apply", the AI transfers the live call — with a pre-loaded student brief so your team never asks for context twice.',
  },
  {
    icon:  TrendingUp,
    color: 'teal',
    title: 'Full-Funnel Analytics',
    desc:  'Campaign ROI, counsellor close rates, time-of-day heatmaps, cost per enrolled student — everything visible in one multi-tenant CRM dashboard.',
  },
] as const;

const HOW_IT_WORKS = [
  {
    step:  '01',
    title: 'Upload Leads & Knowledge Base',
    desc:  'Import a CSV of JEE aspirants and drop your college PDF. Our pipeline chunks, embeds, and indexes it into your private Pinecone namespace in under 60 seconds.',
  },
  {
    step:  '02',
    title: 'The AI Counsellor Calls',
    desc:  'Your bot dials up to 2,000 students simultaneously in Hinglish — answering questions about fees, placements, and hostel from your own indexed data.',
  },
  {
    step:  '03',
    title: 'Your Team Closes the Deals',
    desc:  'Every call is scored and transcribed. Hot leads are surfaced first. Counsellors accept warm transfers and work only with students ready to enrol.',
  },
];

const TESTIMONIALS = [
  {
    quote:    'We replaced a 60-person calling team with VoiceBot CRM. Cost per qualified lead dropped from ₹4,200 to ₹680 in the first month. The ROI was immediate.',
    name:     'Priya Rajan',
    role:     'Admissions Head, Amity University',
    initials: 'PR',
    color:    'emerald',
  },
  {
    quote:    'The Hinglish voice is genuinely indistinguishable from a real counsellor. Students engage — we went from 12% to 31% connect rate in six weeks.',
    name:     'Rajesh Gupta',
    role:     'VP Admissions, Chandigarh University',
    initials: 'RG',
    color:    'teal',
  },
];

// ── Tailwind class maps ────────────────────────────────────────────────────
const FEATURE_ICON_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25',
  teal:    'bg-teal-500/15    text-teal-400    ring-1 ring-teal-500/25',
};

const TESTIMONIAL_RING: Record<string, string> = {
  emerald: 'ring-emerald-500/30',
  teal:    'ring-teal-500/30',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

export default async function LandingPage() {

  // ── Smart routing — logged-in users skip the landing page ───────────────
  const { userId, sessionClaims } = await auth();
  if (userId) {
    const meta = sessionClaims?.publicMetadata as UserPublicMetadata | undefined;
    const role = meta?.role as UserRole | undefined;
    redirect(role && ROLE_HOME[role] ? ROLE_HOME[role] : '/unauthorized');
  }

  // ── Render public landing page ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden
                    selection:bg-emerald-500/30 selection:text-white">

      {/* ────────────────────────────────────────────────────────────────────
          NAVBAR — fixed glassmorphism
      ──────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50
                         bg-slate-950/70 backdrop-blur-xl
                         border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600
                            flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              VoiceBot<span className="text-emerald-400"> CRM</span>
            </span>
          </Link>

          {/* Centre nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features',     href: '#features'     },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing',      href: '#pricing'      },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:block text-sm text-slate-400 hover:text-white
                         transition-colors font-medium"
            >
              Sign in
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl
                         font-semibold shadow-md shadow-emerald-900/40 px-5 transition-colors"
            >
              <Link href="/sign-in">
                Get Started
                <ChevronRight className="w-4 h-4 ml-1 -mr-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────────
          HERO — pastel green glowing, full-viewport with AI voice animation
      ──────────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center
                          min-h-screen px-6 pt-32 pb-24 overflow-hidden">

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
          aria-hidden
        />

        {/* Ambient glow orbs (Pastel Green/Teal) */}
        <div className="absolute top-1/4 -left-40 w-[700px] h-[700px]
                        bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none"
             aria-hidden />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px]
                        bg-teal-600/15 rounded-full blur-[120px] pointer-events-none"
             aria-hidden />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[900px] h-[300px]
                        bg-emerald-800/20 rounded-full blur-[100px] pointer-events-none"
             aria-hidden />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

          {/* Eyebrow badge with AI Voice Animation pulse */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                          border border-emerald-500/30 bg-emerald-500/10 text-emerald-300
                          text-sm font-medium relative group">
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400 -left-1 animate-ping opacity-75"></span>
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
            Sarvam AI · Exotel · Pinecone RAG · Vapi.ai
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight
                         leading-[1.06] mb-7">
            AI Counsellors for{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-500
                             bg-clip-text text-transparent">
              Every Aspirant
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            VoiceBot CRM gives your admissions team an AI that speaks Hinglish, knows
            your college data inside-out, and calls 2,000 students simultaneously —
            handing off only the ones ready to enrol.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl
                         px-8 h-12 font-semibold shadow-xl shadow-emerald-900/50
                         transition-all hover:scale-[1.02]"
            >
              <Link href="/sign-in">
                Start for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-100
                         rounded-xl px-8 h-12 font-medium backdrop-blur-sm
                         transition-all hover:border-emerald-500/40"
            >
              <Link href="#how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2
                          text-sm text-slate-500">
            {[
              'No credit card required',
              'TRAI / DND compliant out of the box',
              '18+ engineering colleges onboarded',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          STATS BAR — 4 key numbers
      ──────────────────────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-10
                        grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center text-center px-6
                         ${i > 0 ? 'md:border-l border-white/5' : ''}`}
            >
              <span className="text-3xl font-bold text-emerald-50 tracking-tight">{value}</span>
              <span className="text-sm text-slate-500 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          FEATURES GRID — 6 cards
      ──────────────────────────────────────────────────────────────────── */}
      <section id="features" className="relative px-6 py-28 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4
                            border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold
                            uppercase tracking-widest">
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Everything your admissions team needs
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              One platform for AI calling, lead qualification, compliance,
              and counsellor handoff — built for Indian engineering admissions.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group relative p-6 rounded-2xl
                           bg-white/[0.03] border border-white/5
                           hover:border-emerald-500/30 hover:bg-emerald-900/10
                           transition-all duration-300 overflow-hidden"
              >
                {/* Subtle hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                                transition-opacity duration-500 pointer-events-none
                                bg-gradient-to-br from-emerald-500/[0.03] to-transparent" />

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                                 mb-4 ${FEATURE_ICON_CLASSES[color]}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>

                <h3 className="text-base font-semibold text-emerald-50 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          HOW IT WORKS — 3 steps
      ──────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-28">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4
                            border border-teal-500/20 bg-teal-500/10 text-teal-400 text-xs font-semibold
                            uppercase tracking-widest">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Live in three steps
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              From CSV upload to your first qualified lead handoff —
              your AI counsellor is running in under an hour.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-10 left-[22%] right-[22%]
                            h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
                 aria-hidden />

            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center group">

                {/* Step number bubble */}
                <div className="relative w-20 h-20 mb-6">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-2xl
                                  bg-gradient-to-br from-emerald-500/30 to-teal-500/30
                                  blur-md group-hover:blur-lg transition-all" />
                  <div className="relative w-full h-full rounded-2xl
                                  bg-slate-900 border border-emerald-500/20
                                  flex items-center justify-center
                                  group-hover:border-emerald-400/40 transition-colors">
                    <span className="text-2xl font-bold bg-gradient-to-br
                                     from-emerald-300 to-teal-400
                                     bg-clip-text text-transparent">
                      {step}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-emerald-50 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          TESTIMONIALS — 2 cards
      ──────────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              Trusted by admissions teams across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
              <div
                key={name}
                className={`p-7 rounded-2xl bg-white/[0.03] border border-white/5
                            ring-1 ${TESTIMONIAL_RING[color]}
                            hover:bg-white/[0.05] transition-colors`}
              >
                <Quote className="w-6 h-6 text-emerald-700/50 mb-4" />
                <p className="text-slate-300 text-[15px] leading-relaxed mb-6 italic">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                   text-sm font-bold text-white flex-shrink-0
                                   ${color === 'emerald'
                                     ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                                     : 'bg-gradient-to-br from-teal-500 to-teal-700'
                                   }`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none">{name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          FINAL CTA SECTION
      ──────────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-32 overflow-hidden">

        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] bg-emerald-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
            Ready to fill your
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400
                             bg-clip-text text-transparent">
              next intake faster?
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
            Join 18+ engineering colleges already using AI to turn JEE aspirants
            into enrolled students at a fraction of the traditional cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl
                         px-10 h-12 font-semibold shadow-xl shadow-emerald-900/50
                         transition-all hover:scale-[1.02]"
            >
              <Link href="/sign-in">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white
                         rounded-xl px-10 h-12 font-medium"
            >
              <Link href="mailto:demo@voicebotcrm.in">
                Book a Live Demo
              </Link>
            </Button>
          </div>
          <p className="text-slate-600 text-sm mt-5">
            No credit card required · Setup in under an hour
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          FOOTER
      ──────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">

            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600
                                flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">VoiceBot CRM</span>
              </Link>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                AI-powered outbound calling platform built specifically
                for Indian engineering college admissions.
              </p>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              {[
                {
                  heading: 'Product',
                  links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
                },
                {
                  heading: 'Compliance',
                  links: ['TRAI / DND', 'Privacy Policy', 'Terms of Service', 'Data Processing'],
                },
                {
                  heading: 'Company',
                  links: ['About', 'Blog', 'Contact', 'Book Demo'],
                },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <p className="font-semibold text-slate-300 mb-3">{heading}</p>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <Link
                          href="#"
                          className="text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between
                          gap-4 pt-8 border-t border-white/5">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} VoiceBot CRM. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}