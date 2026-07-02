// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';
import Link       from 'next/link';
import { 
  Layers, CheckCircle2, ShieldCheck, 
  Sparkles, ArrowLeft, Headset 
} from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 selection:bg-emerald-500/30">
      
      {/* ────────────────────────────────────────────────────────────────────
          LEFT PANEL — Dark Marketing / Brand Side (Pastel Green Theme)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative flex-col justify-between overflow-hidden">
        
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

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px]
                        bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none"
             aria-hidden />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-teal-600/15 rounded-full blur-[100px] pointer-events-none"
             aria-hidden />

        <div className="relative z-10 p-12 flex flex-col h-full">
          {/* Top Navbar */}
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600
                              flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                VoiceBot<span className="text-emerald-400"> CRM</span>
              </span>
            </Link>
            
            <Link href="/" className="text-sm font-medium text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to site
            </Link>
          </div>

          {/* Middle Content */}
          <div className="mt-auto mb-auto max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6
                            border border-emerald-500/30 bg-emerald-500/10 text-emerald-300
                            text-xs font-semibold uppercase tracking-widest relative">
              <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 -left-0.5 animate-ping opacity-75"></span>
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
              Agent Active
            </div>

            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Scale your admission calling instantly.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Log in to your workspace to upload fresh leads, view live call transcripts, and track intent scoring in real-time.
            </p>

            {/* Feature Checkmarks */}
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: 'Enterprise-grade 256-bit encryption' },
                { icon: CheckCircle2, text: 'TRAI / DND compliant infrastructure' },
                { icon: Headset, text: 'Live counselor handoff enabled' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Stat */}
          <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-300">IIIT</div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-teal-500/20 flex items-center justify-center text-[10px] font-bold text-teal-300">NIT</div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">VIT</div>
            </div>
            <p className="text-sm text-slate-400">Trusted by <span className="font-semibold text-white">18+ institutions</span></p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          RIGHT PANEL — Clean Authentication Side
      ──────────────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600
                            flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-900">
              VoiceBot<span className="text-emerald-600"> CRM</span>
            </span>
          </Link>
        </div>

        {/* The Clerk SignIn Component */}
        <div className="w-full max-w-[400px]">
          <SignIn 
            routing="path" 
            path="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full shadow-none",
                card: "shadow-none w-full border-0 p-0 rounded-none bg-transparent",
                headerTitle: "text-3xl font-bold text-slate-900 tracking-tight",
                headerSubtitle: "text-slate-500 text-base mt-2",
                formButtonPrimary: 
                  "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-11 w-full rounded-xl transition-all",
                formFieldInput: 
                  "h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm",
                formFieldLabel: "text-slate-700 font-medium mb-1.5",
                dividerLine: "bg-slate-200",
                dividerText: "text-slate-500 font-medium",
                socialButtonsBlockButton: 
                  "h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 font-medium rounded-xl transition-colors",
                socialButtonsBlockButtonText: "font-semibold text-sm",
                footerActionLink: "text-emerald-600 hover:text-emerald-700 font-semibold",
                identityPreviewEditButtonIcon: "text-emerald-600 hover:text-emerald-700",
              },
            }}
          />
        </div>
      </div>

    </div>
  );
}