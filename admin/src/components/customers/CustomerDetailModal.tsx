import React, { useState } from 'react';
import { Customer } from '../../types/index.ts';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { addCustomerNote, updateCustomer } from '../../store/customersSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.ts';
import { StatusBadge } from '../common/Badge.tsx';
import { X, Mail, MapPin, Calendar, Plus, MessageSquare, ShoppingBag } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose }) => {
  const dispatch = useAppDispatch();
  const allOrders = useAppSelector((state) => state.orders.items);
  const [newNote, setNewNote] = useState('');

  if (!customer) return null;

  const customerOrders = allOrders.filter(
    (o) => o.customer.email.toLowerCase() === customer.email.toLowerCase() || o.customer.id === customer.id
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    dispatch(addCustomerNote({ customerId: customer.id, note: newNote.trim() }));
    dispatch(
      addToast({
        type: 'success',
        title: 'Note Saved',
        message: `Internal memo added to ${customer.name}'s profile.`,
      })
    );
    setNewNote('');
  };

  const handleToggleVip = () => {
    const nextStatus = customer.status === 'vip' ? 'active' : 'vip';
    dispatch(updateCustomer({ id: customer.id, changes: { status: nextStatus } }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Customer Status Changed',
        message: `${customer.name} is now ${nextStatus.toUpperCase()}.`,
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={customer.avatar}
                alt={customer.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 bg-slate-100"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {customer.name}
                  </h2>
                  <StatusBadge status={customer.status} type="customer" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{customer.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleVip}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {customer.status === 'vip' ? 'Demote from VIP' : 'Promote to VIP'}
              </button>
              <button
                onClick={onClose}
                aria-label="Close customer dialog"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-5 pt-4 text-xs">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 font-medium">Lifetime Spend</div>
                <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatCurrency(customer.lifetimeValue)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 font-medium">Total Orders</div>
                <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {customer.totalOrders}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 font-medium">Location</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {customer.city}, {customer.country}
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Recent Orders</span>
                <span className="text-[11px] text-slate-500 font-normal">{customerOrders.length} records</span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
                  No orders placed yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">#{ord.id}</span>
                        <span className="text-slate-400 mx-2">·</span>
                        <span className="text-slate-500">{formatDate(ord.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={ord.fulfillmentStatus} type="fulfillment" />
                        <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(ord.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                Account Notes & Relationship History
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add note (e.g., requested rush shipping, wholesale inquiry)..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-1.5 pt-1">
                {customer.notes.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No notes recorded yet.</p>
                ) : (
                  customer.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{note}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
