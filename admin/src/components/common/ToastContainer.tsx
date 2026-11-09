import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { removeToast } from '../../store/uiSlice.ts';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title?: string;
    message: string;
  };
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg text-sm text-slate-800 dark:text-slate-100 transition-all transform duration-200 animate-in fade-in slide-in-from-bottom-2"
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {toast.title && <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mb-0.5">{toast.title}</div>}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{toast.message}</div>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Close notification"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
