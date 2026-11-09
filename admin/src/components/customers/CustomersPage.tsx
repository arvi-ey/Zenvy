import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { setCustomerSearchQuery, setCustomerStatusFilter } from '../../store/customersSlice.ts';
import { Customer } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { StatusBadge } from '../common/Badge.tsx';
import { CustomerDetailModal } from './CustomerDetailModal.tsx';
import { CustomerFormModal } from './CustomerFormModal.tsx';
import { Search, Plus, Users, Crown, CreditCard, Eye, Mail, MapPin } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: customers, searchQuery, statusFilter } = useAppSelector((state) => state.customers);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Metrics
  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.status === 'vip').length;
  const totalLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

  // Filter
  const filtered = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchCity = c.city.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCity) return false;
    }

    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Accounts</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {totalCustomers}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active directory profiles</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            VIP Clients
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 mt-1">
            {vipCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">High-tier lifetime value</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total LTV
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalLTV)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Accumulated spend</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Customer LTV</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(avgLTV)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Per registered account</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setCustomerSearchQuery(e.target.value))}
              placeholder="Search customers by name, email, or city..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Tier:</span>
              <select
                value={statusFilter}
                onChange={(e) => dispatch(setCustomerStatusFilter(e.target.value))}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="vip">VIP Only</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No customers found</h3>
            <p className="text-xs text-slate-500 mt-1">No profiles match your current search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-center">Orders</th>
                  <th className="py-3 px-3 text-right">Lifetime Spend</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {customer.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {customer.city}, {customer.country}
                    </td>

                    <td className="py-3 px-3 text-center font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                      {customer.totalOrders}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(customer.lifetimeValue)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={customer.status} type="customer" />
                    </td>

                    <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {formatDate(customer.lastOrderAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
