import React from 'react';
import { ProductStatus, PaymentStatus, FulfillmentStatus, CustomerStatus } from '../../types/index.ts';

// Clean, quiet status display adhering to the Zero-Pill & Metadata Discipline:
// Unboxed or clean quiet segmented tags with typographic clarity, never garish candy pills.

interface StatusBadgeProps {
  status: ProductStatus | PaymentStatus | FulfillmentStatus | CustomerStatus | string;
  type?: 'product' | 'payment' | 'fulfillment' | 'customer';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'fulfillment' }) => {
  const getStyle = () => {
    switch (status) {
      // Fulfillment & Delivery - Black and White aesthetic
      case 'delivered':
      case 'paid':
      case 'published':
      case 'active':
        return {
          bg: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-medium',
          dot: 'bg-white dark:bg-slate-900',
        };
      case 'shipped':
      case 'vip':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
          dot: 'bg-blue-500',
        };
      case 'processing':
      case 'pending':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
          dot: 'bg-amber-500',
        };
      case 'draft':
      case 'unfulfilled':
      case 'inactive':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
      case 'cancelled':
      case 'refunded':
      case 'failed':
      case 'archived':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStyle();
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border ${style.bg} whitespace-nowrap shrink-0`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
