import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, FileText, Bell, Zap, CheckCircle, XCircle,
  CalendarDays, Wallet, BarChart3, Shield, ArrowRight, Menu, X,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── Pricing data ──────────────────────────────────────────────────────────────
const PRICING = {
  monthly: { price: '$5', period: '/month', annual: null },
  annual:  { price: '$45', period: '/year', annual: '$3.75 / month — billed annually' },
};

const FREE_FEATURES  = ['1 client / employer', 'Session tracking', 'Payment history', 'PDF invoices'];
const PRO_FEATURES   = ['Unlimited clients', 'Monthly breakdown & Excel export', 'Payment demand letters (PDF)', 'Overdue email alerts', 'Google Calendar sync'];

// ── Sub-components ────────────────────────────────────────────────────────────
function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-semibold text-white">PayTrack</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-slate-400" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-slate-950 px-5 py-4 space-y-3">
          <a href="#features" className="block text-sm text-slate-400 hover:text-white" onClick={() => setOpen(false)}>Features</a>
          <a href="#how" className="block text-sm text-slate-400 hover:text-white" onClick={() => setOpen(false)}>How it works</a>
          <a href="#pricing" className="block text-sm text-slate-400 hover:text-white" onClick={() => setOpen(false)}>Pricing</a>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white">Sign in</Link>
            <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white text-center">
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function PricingToggle({ cycle, setCycle }) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 gap-1">
        {['monthly', 'annual'].map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              cycle === c ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white',
            )}
          >
            {c === 'annual' ? 'Annual' : 'Monthly'}
            {c === 'annual' && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                Save 25%
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function Landing() {
  const [cycle, setCycle] = useState('annual');
  const pricing = PRICING[cycle];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-5 text-center overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[800px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <Zap className="h-3.5 w-3.5" /> Built for instructors and freelancers in Egypt & MENA
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Your work is documented.
            <br />
            <span className="text-indigo-400">Now get paid for it.</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-slate-400 leading-relaxed">
            Track every session, calculate exactly what you&apos;re owed, and generate
            legal-grade demand letters when managers don&apos;t pay. Stop chasing. Start documenting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="rounded-xl border border-white/10 px-6 py-3 text-base font-medium text-slate-300 hover:border-white/20 hover:text-white transition-colors"
            >
              See pricing
            </a>
          </div>

          <p className="text-xs text-slate-500">Free forever · No credit card required</p>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-10">
            Sound familiar?
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '😤', text: 'You finished the work. They "forgot" to pay — again.' },
              { icon: '📭', text: 'You have no proof of what you\'re owed beyond memory and WhatsApp messages.' },
              { icon: '😬', text: 'Chasing payment feels awkward. You lose money or you lose the relationship.' },
            ].map((p) => (
              <div key={p.text} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-center">
                <div className="mb-3 text-3xl">{p.icon}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-5">
        <div className="mx-auto max-w-5xl space-y-14">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to prove your case</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From logging your first session to sending a formal demand letter — one tool, no spreadsheets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: CalendarDays,
                title: 'Session tracking',
                desc: 'Log every teaching session or work block with hours, rates, and earnings. Supports hourly, per-session, and milestone billing.',
              },
              {
                icon: Wallet,
                title: 'Payment history',
                desc: 'Record payments as they arrive. Your running balance updates automatically — no more mental math.',
              },
              {
                icon: FileText,
                title: 'PDF demand letters',
                desc: 'Generate a formal, evidence-backed demand letter covering all overdue cycles. One click, ready to send or print.',
                pro: true,
              },
              {
                icon: Bell,
                title: 'Overdue alerts',
                desc: 'Daily email at 9 AM if any salary cycle is unpaid past your threshold. You\'ll never forget to follow up.',
                pro: true,
              },
              {
                icon: BarChart3,
                title: 'Monthly reports',
                desc: 'Per-cycle breakdown with cumulative earned vs paid. Export to Excel for your records.',
                pro: true,
              },
              {
                icon: Shield,
                title: 'Multiple clients',
                desc: 'Manage every employer separately with their own rates, currency, and payment history.',
                pro: true,
              },
            ].map(({ icon: Icon, title, desc, pro }) => (
              <div key={title} className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 space-y-3 hover:border-indigo-500/30 transition-colors">
                {pro && (
                  <span className="absolute top-4 right-4 rounded-full bg-indigo-600/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                    PRO
                  </span>
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 px-5 border-t border-white/5">
        <div className="mx-auto max-w-4xl space-y-14">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Up and running in 3 minutes</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add your client',
                desc: 'Set up an employer with your rates — hourly, per session, or milestone. Takes 60 seconds.',
              },
              {
                step: '02',
                title: 'Log your sessions',
                desc: 'Add sessions manually or sync from Google Calendar. Every hour is tracked with earnings calculated automatically.',
              },
              {
                step: '03',
                title: 'Get paid — or get proof',
                desc: 'Record payments when they arrive. If they don\'t, download a demand letter with your full session evidence attached.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="space-y-4">
                <div className="text-4xl font-bold text-indigo-500/30">{step}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-5 border-t border-white/5">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Simple, honest pricing</h2>
            <p className="text-slate-400">Start free. Upgrade when you need more.</p>
          </div>

          <PricingToggle cycle={cycle} setCycle={setCycle} />

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free plan */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-400">Free</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="mb-1 text-slate-500 text-sm">forever</span>
                </div>
              </div>
              <ul className="space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <XCircle className="h-4 w-4 shrink-0 text-slate-700" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-xl border border-white/10 py-2.5 text-center text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Pro plan */}
            <div className="relative rounded-2xl border border-indigo-500/40 bg-indigo-600/10 p-7 space-y-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Most popular
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-300">Pro</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold">{pricing.price}</span>
                  <span className="mb-1 text-slate-400 text-sm">{pricing.period}</span>
                </div>
                {pricing.annual && (
                  <p className="mt-1 text-xs text-slate-500">{pricing.annual}</p>
                )}
              </div>
              <ul className="space-y-3">
                {[...FREE_FEATURES, ...PRO_FEATURES].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Start free · upgrade anytime
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            Secure payments via LemonSqueezy · Cancel anytime · No hidden fees
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-5 border-t border-white/5 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            The next time someone owes you money,<br />
            <span className="text-indigo-400">you&apos;ll have the proof.</span>
          </h2>
          <p className="text-slate-400">
            Join instructors and freelancers who stopped chasing payments and started documenting them.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-slate-600">No credit card required</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-5">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-slate-400">PayTrack</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-400 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-slate-400 transition-colors">Register</Link>
            <a href="#pricing" className="hover:text-slate-400 transition-colors">Pricing</a>
          </div>
          <p>© {new Date().getFullYear()} PayTrack. Built for freelancers.</p>
        </div>
      </footer>
    </div>
  );
}
