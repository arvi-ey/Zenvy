import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  setFulfillmentFilter,
  setPaymentFilter,
  setOrderSearchQuery,
  setOrderPage,
  setSelectedOrder,
} from '../../store/ordersSlice.ts';
import { Order, FulfillmentStatus, PaymentStatus } from '../../types/index.ts';
import { formatCurrency, formatDateTime } from '../../utils/formatters.ts';
import { paginateItems } from '../../utils/analyticsCalculations.ts';
import { StatusBadge } from '../common/Badge.tsx';
import { OrderDetailDrawer } from './OrderDetailDrawer.tsx';
import {
  Search,
  ShoppingBag,
  Filter,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: allOrders,
    fulfillmentFilter,
    paymentFilter,
    searchQuery,
    currentPage,
    pageSize,
    selectedOrder,
  } = useAppSelector((state) => state.orders);

  const [activeOrderForDrawer, setActiveOrderForDrawer] = useState<Order | null>(null);

  // Compute metrics
  const totalOrders = allOrders.length;
  const processingCount = allOrders.filter((o) => o.fulfillmentStatus === 'processing').length;
  const shippedCount = allOrders.filter((o) => o.fulfillmentStatus === 'shipped').length;
  const deliveredCount = allOrders.filter((o) => o.fulfillmentStatus === 'delivered').length;
  const unfulfilledCount = allOrders.filter((o) => o.fulfillmentStatus === 'unfulfilled').length;
  const totalSalesVolume = allOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtering
  const filteredOrders = allOrders.filter((order) => {
    // Search query: ID, customer name, email
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customer.name.toLowerCase().includes(q);
      const matchEmail = order.customer.email.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchEmail) return false;
    }

    // Fulfillment filter
    if (fulfillmentFilter !== 'all' && order.fulfillmentStatus !== fulfillmentFilter) {
      return false;
    }

    // Payment filter
    if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) {
      return false;
    }

    return true;
  });

  const { items: paginatedOrders, totalPages, totalCount } = paginateItems(
    filteredOrders,
    currentPage,
    pageSize
  );

  const handleOpenDetail = (order: Order) => {
    setActiveOrderForDrawer(order);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Volume</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalSalesVolume)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{totalOrders} orders recorded</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Processing Queue
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-1">
            {processingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Warehouse packing</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            In Transit
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 mt-1">
            {shippedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Carrier dispatched</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Delivered
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {deliveredCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Completed cycles</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Unfulfilled
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300 mt-1">
            {unfulfilledCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting assignment</div>
        </div>
      </div>

      {/* Action / Search / Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setOrderSearchQuery(e.target.value))}
              placeholder="Search by Order ID (e.g. ZNV-8921) or customer name/email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          {/* Payment filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => dispatch(setPaymentFilter(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Fulfillment Segmented Control Buttons (Interactive filter tabs per §1.A) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Orders', count: allOrders.length },
            { id: 'processing', label: 'Processing', count: processingCount },
            { id: 'shipped', label: 'Shipped', count: shippedCount },
            { id: 'delivered', label: 'Delivered', count: deliveredCount },
            { id: 'unfulfilled', label: 'Unfulfilled', count: unfulfilledCount },
            { id: 'cancelled', label: 'Cancelled', count: allOrders.filter((o) => o.fulfillmentStatus === 'cancelled').length },
          ].map((tab) => {
            const isActive = fulfillmentFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch(setFulfillmentFilter(tab.id))}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono tabular-nums opacity-70">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {paginatedOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOpenDetail(order)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      #{order.id}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {order.customer.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {order.customer.email}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      <span className="font-mono tabular-nums font-medium">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>{' '}
                      {order.items.length === 1 ? 'item' : 'items'}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(order);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              Showing <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> orders
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => dispatch(setOrderPage(currentPage - 1))}
                aria-label="Previous page"
                className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => dispatch(setOrderPage(currentPage + 1))}
                aria-label="Next page"
                className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <OrderDetailDrawer
        order={activeOrderForDrawer}
        onClose={() => setActiveOrderForDrawer(null)}
      />
    </div>
  );
};
