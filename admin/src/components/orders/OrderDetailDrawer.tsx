import React, { useState } from 'react';
import { useAppDispatch } from '../../store/index.ts';
import { updateFulfillmentStatus, updatePaymentStatus, refundOrder } from '../../store/ordersSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { Order, FulfillmentStatus, PaymentStatus } from '../../types/index.ts';
import { formatCurrency, formatDateTime } from '../../utils/formatters.ts';
import { StatusBadge } from '../common/Badge.tsx';
import { X, Truck, CheckCircle, Clock, RotateCcw, MapPin, Mail, Phone, CreditCard, ShieldCheck } from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order, onClose }) => {
  const dispatch = useAppDispatch();

  // Local state for tracking and refund
  const [carrier, setCarrier] = useState(order?.carrier || 'FedEx Express');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(order?.totalAmount || 0);

  if (!order) return null;

  const handleUpdateFulfillment = (newStatus: FulfillmentStatus) => {
    dispatch(
      updateFulfillmentStatus({
        id: order.id,
        status: newStatus,
        trackingNumber: trackingNumber || order.trackingNumber,
        carrier: carrier || order.carrier,
        note: `Updated to ${newStatus} by admin`,
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Order Updated',
        message: `Order #${order.id} status changed to ${newStatus}.`,
      })
    );
  };

  const handleUpdatePayment = (newStatus: PaymentStatus) => {
    dispatch(updatePaymentStatus({ id: order.id, status: newStatus }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Payment Updated',
        message: `Order #${order.id} marked as ${newStatus}.`,
      })
    );
  };

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0) return;

    dispatch(
      refundOrder({
        id: order.id,
        amount: Number(refundAmount),
        reason: refundReason || 'Customer requested return / cancellation',
      })
    );
    dispatch(
      addToast({
        type: 'warning',
        title: 'Refund Executed',
        message: `Refund of ${formatCurrency(Number(refundAmount))} recorded for #${order.id}.`,
      })
    );
    setIsRefunding(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  #{order.id}
                </h2>
                <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Placed on {formatDateTime(order.createdAt)}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close order drawer"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {/* Quick Status Control Panel */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Fulfillment Dispatch Controls
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={order.fulfillmentStatus}
                    onChange={(e) => handleUpdateFulfillment(e.target.value as FulfillmentStatus)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Processing (In Warehouse)</option>
                    <option value="shipped">Shipped (In Transit)</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handleUpdatePayment(e.target.value as PaymentStatus)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="paid">Paid (Confirmed)</option>
                    <option value="pending">Pending Payment</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Carrier and Tracking inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="FedEx, DHL, UPS..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Tracking Code</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="FX-1234567-US"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                Purchased Line Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {item.sku} · Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 font-mono tabular-nums">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-slate-900 dark:text-slate-100 font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax Estimated</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>Total Billed</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customer Contact</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {order.customer.name}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Mail className="w-3 h-3" />
                  <span>{order.customer.email}</span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Phone className="w-3 h-3" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Shipping Address</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div>{order.shippingAddress.street}</div>
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{order.shippingAddress.country}</div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">Activity Log & Timeline</div>
              <div className="space-y-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-3 pb-2 text-xs">
                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{event.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{formatDateTime(event.timestamp)}</div>
                    {event.note && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded mt-1">
                        {event.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Action Drawer toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {!isRefunding ? (
                <button
                  type="button"
                  onClick={() => setIsRefunding(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Issue Order Refund / Return</span>
                </button>
              ) : (
                <form onSubmit={handleProcessRefund} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-lg space-y-3">
                  <div className="font-semibold text-xs text-rose-800 dark:text-rose-300">
                    Process Refund for #{order.id}
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      Refund Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      max={order.totalAmount}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      Reason for refund
                    </label>
                    <input
                      type="text"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="e.g. Returned in original packaging"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRefunding(false)}
                      className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-sm"
                    >
                      Confirm Full Refund
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
