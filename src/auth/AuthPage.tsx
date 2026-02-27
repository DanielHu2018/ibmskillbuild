import { useState } from 'react';
import { cn } from '@/utils/cn';
import { signIn, signUp } from './authStore';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Brain, TrendingUp, Shield, Zap } from 'lucide-react';

interface AuthPageProps {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        const r = await signUp(name, email, password);
        if (!r.ok) { setError(r.error || 'Sign-up failed.'); setLoading(false); return; }
        setSuccess('Account created! Logging you in...');
        setTimeout(onAuth, 800);
      } else {
        const r = await signIn(email, password);
        if (!r.ok) { setError(r.error || 'Sign-in failed.'); setLoading(false); return; }
        onAuth();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, label: 'Multiple Portfolios', desc: 'Track and compare unlimited portfolios side-by-side' },
    { icon: Brain, label: 'AI Chatbot', desc: 'NARRA AI answers your market and risk questions in real time' },
    { icon: Shield, label: 'Price Alerts', desc: 'Automated email alerts when your targets hit' },
    { icon: Zap, label: 'Live Data', desc: 'Real-time quotes, news feed and Alpha Vantage integration' },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-black text-base shadow-lg shadow-cyan-900/40">
            N
          </div>
          <div>
            <div className="text-lg font-black tracking-wide text-white">NARRA</div>
            <div className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Narrative Risk Reasoning Agent</div>
          </div>
        </div>

        {/* Hero */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-800/40 bg-cyan-950/30 px-3 py-1.5 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Institutional-Grade AI Risk Engine</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              The New Risk<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Operating System</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              NARRA autonomously ingests global events, translates narratives into quantitative risk factors,
              simulates portfolio impact in real time, and proposes optimized hedges — all with full audit trail.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(f => (
              <div key={f.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <f.icon size={16} className="text-cyan-400 mb-2" />
                <div className="text-xs font-bold text-white mb-1">{f.label}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-8">
          {[
            { value: '100K', label: 'MC Paths' },
            { value: '<6m', label: 'Full Cycle' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: 'SR 11-7', label: 'Compliant' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-xl font-black text-cyan-400 font-mono">{s.value}</div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-black text-sm">N</div>
            <div className="text-lg font-black text-white">NARRA</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-400">
              {mode === 'signin'
                ? 'Sign in to access your portfolios and risk engine.'
                : 'Start tracking portfolios with AI-powered risk analysis.'}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/50 p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={cn(
                  'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
                  mode === m ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-900/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={14} className="shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 transition-all"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {mode === 'signin' ? 'Sign In to NARRA' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <p className="mt-8 text-center text-[10px] text-slate-700">
            NARRA v2.4.1 · SR 11-7 Compliant · IBM watsonx Granite · Classification: CONFIDENTIAL
          </p>
        </div>
      </div>
    </div>
  );
}
