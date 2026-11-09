import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface PublicHomePageProps {
  onNavigate: (path: string) => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({ onNavigate }) => (
  <main className="min-h-screen bg-slate-950 text-white">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <a href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }} className="text-xl font-bold tracking-tight">
        ZENVY <span className="text-slate-400">ADMIN</span>
      </a>
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('/sign-in')} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
          Sign in
        </button>
        <button onClick={() => onNavigate('/sign-up')} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
          Admin setup
        </button>
      </div>
    </header>
    <section className="mx-auto flex max-w-7xl flex-col items-start px-6 pb-24 pt-20 md:pt-32">
      <div className="mb-6 flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300">
        <ShieldCheck className="h-4 w-4" /> Secure administrator access
      </div>
      <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
        One place to manage your Zenvy store.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        Manage the product catalog and categories with role-protected access to your store data.
      </p>
      <button onClick={() => onNavigate('/sign-in')} className="mt-9 flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200">
        Continue to admin sign in <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-4 text-sm text-slate-500">
        First-time admin registration closes automatically after the first account is created.
      </p>
    </section>
  </main>
);
