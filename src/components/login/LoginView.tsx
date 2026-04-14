'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Package, Clock, AlertTriangle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  error: string;
  isLoading: boolean;
}

export default function LoginView({ onLogin, onRegister, error, isLoading }: LoginViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left Panel: Abstract Visual ── */}
      <div className="relative hidden w-[48%] overflow-hidden bg-gradient-to-br from-[#2D2926] via-[#1C1C1C] to-[#2A2420] lg:flex lg:items-center lg:justify-center">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-[15%] left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(198,125,75,0.35),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-[20%] right-[15%] h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(91,140,90,0.25),transparent_70%)] blur-3xl" />
          <div className="absolute top-[50%] left-[40%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(196,69,54,0.2),transparent_70%)] blur-3xl" />
        </div>

        {/* Floating geometric elements */}
        <motion.div
          className="absolute top-[20%] right-[20%] h-20 w-20 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[15%] h-32 w-32 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
          animate={{
            x: [0, 15, 0],
            y: [0, -12, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-[60%] right-[30%] h-16 w-16 rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm rotate-12"
          animate={{
            rotate: [12, -8, 12],
            y: [0, -10, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content overlay */}
        <div className="relative z-10 max-w-sm px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Package className="h-5 w-5 text-white/80" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight text-white/90">
                ExpTrack
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl font-bold leading-tight tracking-tight text-white/95"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            Never let a product
            <br />
            expire unnoticed.
          </motion.h1>

          <motion.p
            className="mt-5 text-base leading-relaxed text-white/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Intelligent batch-level expiration tracking designed for teams who take freshness seriously.
          </motion.p>

          <motion.div
            className="mt-10 space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[rgba(196,69,54,0.2)]">
                <AlertTriangle className="h-3.5 w-3.5 text-[#E8A59C]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">Real-time alerts</p>
                <p className="text-xs text-white/35">Get notified before it&apos;s too late</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[rgba(198,125,75,0.2)]">
                <Clock className="h-3.5 w-3.5 text-[#E2C9A8]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">Batch tracking</p>
                <p className="text-xs text-white/35">Multiple lots per product, always sorted</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(198,125,75,0.4)] to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        />
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="flex w-full flex-col items-center justify-center bg-[var(--bg-primary)] px-6 lg:w-[52%]">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary)]">
            <Package className="h-4.5 w-4.5 text-[var(--text-inverse)]" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            ExpTrack
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[380px]"
          >
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              {mode === 'login'
                ? 'Sign in to manage your inventory expiration dates.'
                : 'Start tracking expiration dates across all your products.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Name field (register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Cooper"
                      required
                      className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  required
                  className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-4 py-3 pr-11 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all duration-200 focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {displayError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-[var(--critical-text)]"
                  >
                    {displayError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Toggle mode */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setLocalError('');
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <span className="font-medium text-[var(--text-primary)]">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="font-medium text-[var(--text-primary)]">Sign in</span>
                  </>
                )}
              </button>
            </div>

            {/* Demo hint */}
            <div className="mt-10 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">
                <span className="font-medium text-[var(--text-secondary)]">Demo mode:</span> Create any account to explore the app with pre-loaded sample data.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
