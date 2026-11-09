import React, { ReactNode } from 'react';
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  description: string;
  sideTitle: string;
  sideDescription: string;
  sidePoints: string[];
  footerPrompt: string;
  footerAction: string;
  footerHref: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

export const authInputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50';
export const authLabelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  description,
  sideTitle,
  sideDescription,
  sidePoints,
  footerPrompt,
  footerAction,
  footerHref,
  onNavigate,
  children,
}) => (
  <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased lg:flex-row">
    <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 xl:w-2/5 xl:p-16 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">Zenvy</span>
        </div>
        <div className="mt-20 max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">{sideTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">{sideDescription}</p>
          <ul className="mt-10 space-y-4">
            {sidePoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative z-10 text-sm text-slate-500">
        <div className="mb-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <p>© 2025 Zenvy Inc. · Enterprise access</p>
      </div>
    </aside>

    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold text-slate-900">Zenvy</span>
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Enterprise</span>
        </div>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.08),0_10px_15px_-6px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-slate-500">
            {footerPrompt}{' '}
            <button
              type="button"
              onClick={() => onNavigate(footerHref)}
              className="font-semibold text-slate-900 underline underline-offset-4 transition hover:text-slate-700"
            >
              {footerAction}
            </button>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Protected by enterprise-grade encryption ·{' '}
          <button type="button" className="underline underline-offset-2 transition hover:text-slate-600">Privacy</button> ·{' '}
          <button type="button" className="underline underline-offset-2 transition hover:text-slate-600">Terms</button>
        </p>
      </div>
    </main>
  </div>
);
