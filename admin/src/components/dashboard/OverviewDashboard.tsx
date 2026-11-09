import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { setActiveTab } from '../../store/uiSlice.ts';
import { formatCurrency, formatPercent } from '../../utils/formatters.ts';
import { StatusBadge } from '../common/Badge.tsx';
import { Order, Product } from '../../types/index.ts';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { OrderDetailDrawer } from '../orders/OrderDetailDrawer.tsx';
import { ProductFormModal } from '../products/ProductFormModal.tsx';

export const OverviewDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.items);
  const products = useAppSelector((state) => state.products.items);
  const customers = useAppSelector((state) => state.customers.items);

  const [activeTimescale, setActiveTimescale] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Compute live calculations from Redux state
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0) + 124500; // Combine with historical ledger
  const totalOrdersCount = orders.length + 380;
  const avgOrderValue = totalRevenue / totalOrdersCount;
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'unfulfilled' || o.fulfillmentStatus === 'processing');

  // Chart data simulation for timescale
  const chartData = [
    { label: 'Mon', revenue: 4200, orders: 14 },
    { label: 'Tue', revenue: 5800, orders: 19 },
    { label: 'Wed', revenue: 5100, orders: 16 },
    { label: 'Thu', revenue: 7400, orders: 24 },
    { label: 'Fri', revenue: 6900, orders: 22 },
    { label: 'Sat', revenue: 9800, orders: 31 },
    { label: 'Sun', revenue: 8400, orders: 27 },
  ];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-slate-100 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last period</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {totalOrdersCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{pendingOrders.length} orders need fulfillment</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Average Order Value */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(avgOrderValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Across luxury & studio categories
            </div>
          </div>
        </div>

        {/* KPI 4: Inventory Health */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {lowStockProducts.length} Alerts
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              Items at or below safe reorder point
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Performance Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Revenue Performance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily net sales volume and order cadence
                </p>
              </div>

              {/* Segmented controls for timescale */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                {(['7d', '30d', '90d'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTimescale(t)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeTimescale === t
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Data Visualization */}
            <div className="pt-6 pb-2">
              <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2">
                {chartData.map((d, idx) => {
                  const heightPercent = Math.round((d.revenue / maxRevenue) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono tabular-nums bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap">
                        {formatCurrency(d.revenue)}
                      </div>
                      <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-44 flex items-end p-1">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-slate-900 dark:bg-white group-hover:bg-black dark:group-hover:bg-slate-200 rounded-t transition-all duration-300"
                        />
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">{d.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-900 dark:bg-white" />
              <span>Fulfilled Orders Volume</span>
            </div>
            <button
              onClick={() => dispatch(setActiveTab('analytics'))}
              className="font-medium text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"
            >
              <span>View In-Depth Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Operations & Backend Architecture Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">
              Quick Operations
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Add New Product
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Upload photos with browser preview
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => dispatch(setActiveTab('orders'))}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Fulfill Orders
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {pendingOrders.length} shipments pending
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => dispatch(setActiveTab('coupons'))}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Discounts & Promotions
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Manage checkout codes & campaigns
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Attention Items: Low Stock alert box */}
          {lowStockProducts.length > 0 && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Restock Required ({lowStockProducts.length})</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                The following products are near exhaustion. Restock soon to prevent order delays:
              </p>
              <div className="space-y-1 pt-1">
                {lowStockProducts.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex justify-between text-xs text-amber-900 dark:text-amber-200 font-medium">
                    <span className="truncate max-w-[180px]">{p.title}</span>
                    <span className="font-mono tabular-nums">{p.stock} remaining</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lower Row: Recent Orders Feed & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Recent Orders
              </h3>
              <button
                onClick={() => dispatch(setActiveTab('orders'))}
                className="text-xs text-slate-900 dark:text-slate-100 hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-mono text-[11px] font-semibold">
                      #{order.id.slice(-4)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {order.customer.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {order.shippingAddress.city}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Inventory */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Top Performing Products
              </h3>
              <button
                onClick={() => dispatch(setActiveTab('products'))}
                className="text-xs text-slate-900 dark:text-slate-100 hover:underline font-semibold"
              >
                View Catalog
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {product.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {product.sku} · Stock: {product.stock}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                      High Demand
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};
