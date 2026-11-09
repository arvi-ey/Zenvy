import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Check } from 'lucide-react';
import { useAppDispatch } from '../../store/index.ts';
import { addCustomer } from '../../store/customersSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { getCustomerAvatar } from '../../store/mockData.ts';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  status: z.enum(['active', 'vip', 'inactive'] as const),
  initialNote: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      city: 'New York',
      country: 'United States',
      status: 'active',
      initialNote: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CustomerFormData) => {
    dispatch(
      addCustomer({
        name: data.name,
        email: data.email,
        city: data.city,
        country: data.country,
        status: data.status,
        avatar: getCustomerAvatar(data.email),
        notes: data.initialNote ? [data.initialNote] : [],
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Customer Added',
        message: `${data.name} was added to customer database.`,
      })
    );
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Register New Customer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Validated with React Hook Form & Zod schema.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Liam Gallagher"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
              />
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="liam@example.com"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
              />
              {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">City</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Country</label>
                <input
                  type="text"
                  {...register('country')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="active">Active Customer</option>
                <option value="vip">VIP Tier Account</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Initial Account Note (Optional)
              </label>
              <textarea
                rows={2}
                {...register('initialNote')}
                placeholder="Special shipping instructions or customer history..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Customer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
