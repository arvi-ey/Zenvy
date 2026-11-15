import React, { FormEvent, useState } from 'react';
import { ArrowRight, LoaderCircle, Lock, Mail, ShieldCheck } from 'lucide-react';
import { authService, AdminUser } from '../../api/services/authService.ts';

interface AdminSignInPageProps {
  onNavigate: (path: string) => void;
  onAuthenticated: (user: AdminUser) => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Unable to sign in. Please try again.';
}

export const AdminSignInPage: React.FC<AdminSignInPageProps> = ({ onNavigate, onAuthenticated }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await authService.signIn({
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
      if (user.role !== 'admin') {
        throw new Error('This account does not have administrator access.');
      }
      onAuthenticated(user);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased dark:bg-[#282C34]">
      {/* Left — editorial image panel */}
      <aside className="relative hidden w-[52%] overflow-hidden lg:block xl:w-[58%]">
        {/* Production image — replace with your own CDN asset */}
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=2000&q=85"
          alt="Team collaborating in a modern workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Layered overlay: brand tint + vignette */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-indigo-950/80 to-violet-900/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.25),transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-14 xl:p-20">
          {/* Brand */}
          <button
            onClick={() => onNavigate('/')}
            className="group inline-flex items-center gap-3 text-white transition hover:opacity-90"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">Zenvy</span>
          </button>

          {/* Editorial headline */}
          <div className="max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </div>

            <h1 className="text-[42px] font-bold leading-[1.05] tracking-tight text-white xl:text-[52px]">
              The command center
              <br />
              <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                for your store.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
              Monitor operations, manage inventory, and control access — all from a single, hardened console built for enterprise teams.
            </p>

            {/* Feature chips */}
            <div className="mt-9 flex flex-wrap gap-2">
              {['SOC 2 Type II', 'SSO ready', 'Audit logging'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>© 2025 Zenvy Inc.</span>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('/privacy')} className="transition hover:text-white/70">
                Privacy
              </button>
              <button onClick={() => onNavigate('/terms')} className="transition hover:text-white/70">
                Terms
              </button>
              <button onClick={() => onNavigate('/support')} className="transition hover:text-white/70">
                Support
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex w-full flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:w-[48%] lg:px-14 xl:w-[42%]">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <button onClick={() => onNavigate('/')} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Zenvy</span>
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Enterprise
            </span>
          </div>

          {/* Header */}
          <div className="mb-9">
            <h2 className="text-[28px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your administrator dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <circle cx="8" cy="11.25" r="0.75" fill="currentColor" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Work email
              </label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={100}
                  autoComplete="email"
                  placeholder="admin@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="text-xs font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  Forgot password?
                </button>
              </div>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.25" />
                      <path d="M2.5 2.5l11 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.25" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
              />
              <label htmlFor="remember"               className="text-[13px] text-slate-600 dark:text-slate-400">
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus:ring-slate-100/30 dark:focus:ring-offset-[#282C34]"
            >
              {busy ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-medium text-slate-400">New to Zenvy?</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/sign-up')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
          >
            Create the first admin
          </button>

          <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
            By signing in you agree to our{' '}
            <button onClick={() => onNavigate('/terms')} className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Terms
            </button>{' '}
            and{' '}
            <button onClick={() => onNavigate('/privacy')} className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </main>
    </div>
  );
};