'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Package, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  error: string;
  isLoading: boolean;
}

export default function LoginView({ onLogin, onRegister, error, isLoading }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localErr, setLocalErr] = useState('');
  const displayError = localErr || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    try {
      if (mode === 'login') await onLogin(email, password);
      else await onRegister(name, email, password);
    } catch (err) {
      setLocalErr(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Panel - Deep charcoal with organic shapes */}
      <div className="relative hidden w-[48%] overflow-hidden bg-[#232220] lg:flex lg:items-center lg:justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-[8%] left-[-5%] h-[320px] w-[320px] rounded-full bg-[#3A3533] blur-3xl opacity-80" />
          <div className="absolute bottom-[12%] right-[-8%] h-[400px] w-[400px] rounded-full bg-[#2A2725] blur-3xl opacity-90" />
          <div className="absolute top-[45%] left-[25%] h-[200px] w-[200px] rounded-full bg-[#443E3B] blur-2xl opacity-40" />
        </div>

        <motion.div
          className="absolute top-[22%] right-[22%] h-16 w-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[35%] left-[18%] h-24 w-24 rounded-full border border-white/[0.05] bg-white/[0.02]"
          animate={{ y: [0, 10, 0], x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-[55%] right-[28%] h-12 w-12 rounded-lg border border-white/[0.06] bg-white/[0.02] rotate-12"
          animate={{ rotate: [12, -5, 12], y: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-sm px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Package className="h-4 w-4 text-white/70" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-base font-medium text-white/80">ExpTrack</span>
            </div>
          </motion.div>
          <motion.h1 className="font-heading text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-white/90" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
            Stop throwing away<br />expired stock.
          </motion.h1>
          <motion.p className="mt-4 text-[15px] leading-relaxed text-white/40" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
            Track every batch. Get notified before it expires. Simple as that.
          </motion.p>
          <motion.div className="mt-10 space-y-3.5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}>
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#C4513B]/20">
                <AlertTriangle className="h-3 w-3 text-[#E8B4AC]" strokeWidth={2} />
              </div>
              <p className="text-sm text-white/50">Browser alerts for expiring batches</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#B8864A]/20">
                <Clock className="h-3 w-3 text-[#E2C9A8]" strokeWidth={2} />
              </div>
              <p className="text-sm text-white/50">Multiple lots per product</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex w-full flex-col items-center justify-center bg-[var(--bg-primary)] px-6 lg:w-[52%]">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <Package className="h-4 w-4 text-[var(--text-inverse)]" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-base font-medium text-[var(--text-primary)]">ExpTrack</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="w-full max-w-[360px]">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {mode === 'login' ? 'Welcome back. Enter your credentials.' : 'Start tracking your inventory today.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 16 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }}>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--text-secondary)] transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--text-secondary)] transition-colors" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--text-secondary)] transition-colors" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {displayError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-[var(--critical-text)]">{displayError}</motion.p>
                )}
              </AnimatePresence>

              <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }} className="w-full rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press">
                {isLoading ? <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <span className="flex items-center justify-center gap-2">{mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight className="h-4 w-4" /></span>}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalErr(''); }} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {mode === 'login' ? <>No account? <span className="font-medium">Sign up</span></> : <>Have an account? <span className="font-medium">Sign in</span></>}
              </button>
            </div>

            <div className="mt-8 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-3.5">
              <p className="text-xs text-[var(--text-tertiary)]"><span className="font-medium text-[var(--text-secondary)]">Demo:</span> Create any account to explore with sample data.</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
