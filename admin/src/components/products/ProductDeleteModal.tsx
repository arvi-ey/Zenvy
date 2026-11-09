import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Product } from '../../types/index.ts';

interface ProductDeleteModalProps {
  isOpen: boolean;
  product: Product | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  isOpen,
  product,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Confirm Product Deletion
              </h3>
              <p className="text-xs text-slate-500">The product will be removed from the active catalog.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg mb-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-semibold">{product.title}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {product.sku}</div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Are you sure you want to remove this product from your inventory? Historical order references remain intact.
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
