import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authInputClass, authLabelClass } from './AuthLayout.tsx';

interface PasswordFieldProps {
  name: string;
  label: string;
  autoComplete: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ name, label, autoComplete }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={name} className={authLabelClass}>{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          required
          minLength={8}
          maxLength={72}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={`${authInputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600 focus:outline-none"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
