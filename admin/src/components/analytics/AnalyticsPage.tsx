import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { addToast } from '../../store/uiSlice.ts';
import { formatCurrency, formatPercent } from '../../utils/formatters.ts';
import { BarChart3, Download, TrendingUp, DollarSign, PieChart, Globe, ArrowUpRight } from 'lucide-react';
import { INITIAL_ANALYTICS } from '../../store/mockData.ts';

export const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.items);
  const products = useAppSelector((state) => state.products.items);
  const [selectedRange, setSelectedRange] = useState<'30d' | '90d' | '12m'>('30d');

  // Aggregated financials
  const grossSales = orders.reduce((sum, o) => sum + o.subtotal, 0) + 118000;
  const discountsTotal = orders.reduce((sum, o) => sum + o.discountAmount, 0) + 4200;
  const taxesTotal = orders.reduce((sum, o) => sum + o.tax, 0) + 8900;
  const netSales = grossSales - discountsTotal;

  // Handle client-side CSV download
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Date', 'Total Amount', 'Payment Status', 'Fulfillment Status'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customer.name}"`,
      o.customer.email,
      o.createdAt,
      o.totalAmount.toFixed(2),
      o.paymentStatus,
      o.fulfillmentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zenvy_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(
      addToast({
        type: 'success',
        title: 'Export Generated',
        message: 'CSV analytics report downloaded to your device.',
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Analytics & Commercial Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-channel revenue breakdown, tax liability, customer acquisition, and export tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {(['30d', '90d', '12m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedRange === r
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financials Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Gross Sales</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(grossSales)}
          </div>
          <div className="text-[11px] text-slate-900 dark:text-slate-100 font-semibold mt-0.5">+14.2% YoY growth</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Sales</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(netSales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">After deductions & coupons</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Taxes Collected</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(taxesTotal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">State & international VAT</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Promotional Discounts</div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(discountsTotal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Saved by customers</div>
        </div>
      </div>

      {/* Category Breakdown & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-900 dark:text-slate-100" />
              <span>Revenue by Taxonomy Category</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">100% Total Share</span>
          </div>

          <div className="space-y-4 text-xs">
            {INITIAL_ANALYTICS.categoryBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.category}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.sales)}</span>
                    <span className="text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-slate-900 dark:bg-white'
                        : idx === 1
                        ? 'bg-slate-700 dark:bg-slate-300'
                        : idx === 2
                        ? 'bg-slate-500 dark:bg-slate-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Regional Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Geographic Market Share</span>
            </h3>
            <span className="text-xs text-slate-500">Cross-border freight</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { region: 'United States & Canada', share: 58, revenue: 74500 },
              { region: 'European Union & UK', share: 26, revenue: 33400 },
              { region: 'Asia Pacific (Japan, SG, AU)', share: 12, revenue: 15400 },
              { region: 'Rest of World', share: 4, revenue: 5150 },
            ].map((reg, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{reg.region}</div>
                  <div className="text-[11px] text-slate-500">{reg.share}% of order distribution</div>
                </div>
                <div className="text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(reg.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
