import React, { FormEvent, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { authService, AdminUser } from '../../api/services/authService.ts';
import { AuthLayout, authInputClass, authLabelClass } from './AuthLayout.tsx';
import { PasswordField } from './PasswordField.tsx';

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
    <AuthLayout
      title="Create admin account"
      description="First-time setup. This account will have full access to the store dashboard."
      sideTitle="Set up the first administrator"
      sideDescription="Secure your store dashboard with enterprise-grade access control. Only one admin account can be created during initial setup."
      sidePoints={[
        'One-time setup — after this, admin creation is disabled.',
        'Role-based access control with audit logging.',
        'Encrypted credentials and session hardening.',
      ]}
      footerPrompt="Already have an account?"
      footerAction="Sign in"
      footerHref="/sign-in"
      onNavigate={onNavigate}
    >
      {error && <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={authLabelClass}>First name</label>
            <input id="firstName" name="firstName" required minLength={2} maxLength={50} autoComplete="given-name" placeholder="Jane" className={authInputClass} />
          </div>
          <div>
            <label htmlFor="lastName" className={authLabelClass}>Last name</label>
            <input id="lastName" name="lastName" required minLength={2} maxLength={50} autoComplete="family-name" placeholder="Doe" className={authInputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className={authLabelClass}>Phone</label>
          <input id="phone" name="phone" type="tel" required minLength={10} maxLength={15} autoComplete="tel" placeholder="+1 (555) 000-0000" className={authInputClass} />
        </div>
        <div>
          <label htmlFor="email" className={authLabelClass}>Work email</label>
          <input id="email" name="email" type="email" required maxLength={100} autoComplete="email" placeholder="admin@company.com" className={authInputClass} />
        </div>
        <PasswordField name="password" label="Password" autoComplete="new-password" />
        <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" />
        <p className="-mt-2 text-xs leading-5 text-slate-500">Use at least 8 characters, including an uppercase letter and a number.</p>
        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Create admin account
        </button>
      </form>
    </AuthLayout>
  );
};
