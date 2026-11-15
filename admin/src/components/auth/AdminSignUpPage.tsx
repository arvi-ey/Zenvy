import React, { FormEvent, useState } from 'react';
import { ArrowRight, LoaderCircle, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { authService, AdminUser } from '../../api/services/authService.ts';

interface AdminSignUpPageProps {
  onNavigate: (path: string) => void;
  onAuthenticated: (user: AdminUser) => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Unable to create the admin account. Please try again.';
}

export const AdminSignUpPage: React.FC<AdminSignUpPageProps> = ({ onNavigate, onAuthenticated }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    if (password !== String(form.get('confirmPassword'))) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const user = await authService.signUp({
        firstName: String(form.get('firstName')),
        lastName: String(form.get('lastName')),
        email: String(form.get('email')),
        phone: String(form.get('phone')),
        password,
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
    <div className="flex min-h-screen bg-white font-sans antialiased dark:bg-[#282C34]">
      {/* Left — full-bleed image panel */}
      <aside className="relative hidden w-1/2 overflow-hidden lg:block xl:w-[55%]">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-indigo-900/70 to-violet-900/80" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <button
            onClick={() => onNavigate('/')}
            className="group inline-flex items-center gap-3 text-white transition hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">Zenvy</span>
          </button>

          <div className="max-w-md">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              First-time setup
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
              Set up your
              <br />
              admin account.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/70">
              Create the first administrator to unlock your store dashboard. This is a one-time setup — after this, admin creation is disabled.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/50">
            <span>© 2025 Zenvy Inc.</span>
            <span className="h-3 w-px bg-white/25" />
            <button onClick={() => onNavigate('/privacy')} className="transition hover:text-white/80">
              Privacy
            </button>
            <button onClick={() => onNavigate('/terms')} className="transition hover:text-white/80">
              Terms
            </button>
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex w-full flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[420px]">
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
          <div className="mb-8">
            <h2 className="text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">Create admin account</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Set up the first administrator for this workspace.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
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
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  First name
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                  <input
                    id="firstName"
                    name="firstName"
                    required
                    minLength={2}
                    maxLength={50}
                    autoComplete="given-name"
                    placeholder="Jane"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last name
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                  <input
                    id="lastName"
                    name="lastName"
                    required
                    minLength={2}
                    maxLength={50}
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone
              </label>
              <div className="group relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  minLength={10}
                  maxLength={15}
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
                >
                  {showConfirmPassword ? (
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
              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Use at least 8 characters, including an uppercase letter and a number.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus:ring-slate-100/30 dark:focus:ring-offset-[#282C34]"
            >
              {busy ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create admin account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-medium text-slate-400">Already have an account?</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/sign-in')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
          >
            Sign in
          </button>

          <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
            By creating an account you agree to our{' '}
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