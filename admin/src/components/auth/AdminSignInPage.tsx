import React, { FormEvent, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { authService, AdminUser } from '../../api/services/authService.ts';
import { AuthLayout, authInputClass, authLabelClass } from './AuthLayout.tsx';
import { PasswordField } from './PasswordField.tsx';

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
    <AuthLayout
      title="Admin sign in"
      description="Sign in with an administrator account to open the store dashboard."
      sideTitle="Secure admin sign in"
      sideDescription="Sign in with an administrator account to open the store dashboard. Access is restricted to authorized personnel only."
      sidePoints={[
        'Role-based access: only administrators can sign in here.',
        'Role-based access control with audit logging.',
        'Encrypted credentials and session hardening.',
      ]}
      footerPrompt="First-time setup?"
      footerAction="Create the first admin"
      footerHref="/sign-up"
      onNavigate={onNavigate}
    >
      {error && <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={authLabelClass}>Work email</label>
          <input id="email" name="email" type="email" required maxLength={100} autoComplete="email" placeholder="admin@company.com" className={authInputClass} />
        </div>
        <PasswordField name="password" label="Password" autoComplete="current-password" />
        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
};
