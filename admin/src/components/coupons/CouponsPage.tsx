import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { addCoupon, toggleCouponStatus, deleteCoupon } from '../../store/categoriesAndCouponsSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { Coupon } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { Plus, Tag, Trash2, X, Check, Copy, Percent } from 'lucide-react';

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be uppercase alphanumeric'),
  discountType: z.enum(['percentage', 'fixed'] as const),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  minSpend: z.number().nonnegative('Minimum spend cannot be negative'),
  usageLimit: z.number().int().positive('Usage limit must be at least 1'),
  expiresAt: z.string().min(1, 'Expiration date required'),
});

type CouponFormData = z.infer<typeof couponSchema>;

export const CouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const coupons = useAppSelector((state) => state.coupons.items);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      minSpend: 100,
      usageLimit: 250,
      expiresAt: '2026-12-31',
    },
  });

  const discountType = watch('discountType');

  const onSubmit = (data: CouponFormData) => {
    dispatch(
      addCoupon({
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minSpend: Number(data.minSpend),
        usageLimit: Number(data.usageLimit),
        expiresAt: new Date(data.expiresAt).toISOString(),
        status: 'active',
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Coupon Created',
        message: `Promo code "${data.code.toUpperCase()}" is now live.`,
      })
    );
    reset();
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (c: Coupon) => {
    const nextStatus = c.status === 'active' ? 'disabled' : 'active';
    dispatch(toggleCouponStatus({ id: c.id, status: nextStatus }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Coupon Status Updated',
        message: `Code "${c.code}" is now ${nextStatus.toUpperCase()}.`,
      })
    );
  };

  const handleDelete = (c: Coupon) => {
    dispatch(deleteCoupon(c.id));
    dispatch(
      addToast({
        type: 'info',
        title: 'Coupon Deleted',
        message: `Code "${c.code}" removed.`,
      })
    );
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    dispatch(
      addToast({
        type: 'info',
        title: 'Copied to Clipboard',
        message: `Code "${code}" copied.`,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Discounts & Promotional Codes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated checkout discounts, VIP threshold coupons, and marketing promotions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Min Spend</th>
                <th className="py-3 px-3 text-center">Usage / Cap</th>
                <th className="py-3 px-3">Expires</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        title="Copy code"
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : `${formatCurrency(coupon.discountValue)} OFF`}
                  </td>

                  <td className="py-3 px-3 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {coupon.minSpend === 0 ? 'No minimum' : formatCurrency(coupon.minSpend)}
                  </td>

                  <td className="py-3 px-3 text-center font-mono tabular-nums">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {coupon.usageCount}
                    </span>
                    <span className="text-slate-400"> / {coupon.usageLimit}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {formatDate(coupon.expiresAt)}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border ${
                        coupon.status === 'active'
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : coupon.status === 'expired'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          coupon.status === 'active'
                            ? 'bg-white dark:bg-slate-900'
                            : coupon.status === 'expired'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{coupon.status.toUpperCase()}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className="px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {coupon.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
                        title="Delete coupon"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Create Promotional Coupon
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Promo Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('code')}
                    placeholder="e.g. SUMMER25"
                    className={`w-full px-3 py-2 font-mono uppercase rounded-lg border ${
                      errors.code ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                  />
                  {errors.code && <p className="text-[11px] text-rose-500">{errors.code.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Discount Type
                    </label>
                    <select
                      {...register('discountType')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Value {discountType === 'percentage' ? '(%)' : '($)'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('discountValue', { valueAsNumber: true })}
                      className={`w-full px-3 py-2 font-mono rounded-lg border ${
                        errors.discountValue ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                    />
                    {errors.discountValue && (
                      <p className="text-[11px] text-rose-500">{errors.discountValue.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Minimum Spend ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('minSpend', { valueAsNumber: true })}
                      className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Max Total Uses
                    </label>
                    <input
                      type="number"
                      {...register('usageLimit', { valueAsNumber: true })}
                      className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('expiresAt')}
                    className={`w-full px-3 py-2 font-mono rounded-lg border ${
                      errors.expiresAt ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                  />
                  {errors.expiresAt && <p className="text-[11px] text-rose-500">{errors.expiresAt.message}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
                    <span>Save Coupon</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
