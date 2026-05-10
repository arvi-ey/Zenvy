import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { recentOrders, revenueSeries, categoryShare, products } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
  head: () => ({ meta: [{ title: "Overview — Luxe Admin" }] }),
});

const chartColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function Overview() {
  const top = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, Alex</p>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold mt-1">
            Today's <span className="gradient-text">performance</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full glass px-4 py-2 text-xs">Last 30 days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Revenue" value="$382,409" delta={12.4} icon={DollarSign} index={0} />
        <StatCard label="Orders" value="6,820" delta={8.1} icon={ShoppingBag} index={1} />
        <StatCard label="Products" value="412" delta={3.2} icon={Package} index={2} />
        <StatCard label="Customers" value="14,308" delta={-2.1} icon={Users} index={3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="xl:col-span-2 rounded-2xl glass shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Revenue overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue and orders</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl glass shadow-card p-6">
          <h3 className="font-display text-lg font-semibold">Category share</h3>
          <p className="text-xs text-muted-foreground mb-2">By revenue</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {categoryShare.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="xl:col-span-2 rounded-2xl glass shadow-card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Weekly orders</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="orders" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl glass shadow-card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top products</h3>
          <ul className="space-y-3">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="size-9 rounded-xl gradient-accent grid place-items-center text-xs font-semibold text-accent-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sold} sold</p>
                </div>
                <span className="text-sm font-semibold">${p.price}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
        className="rounded-2xl glass shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Recent orders</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border/50">
                  <td className="py-3 pr-4 font-medium">{o.id}</td>
                  <td className="py-3 pr-4">{o.customer}</td>
                  <td className="py-3 pr-4">${o.total.toFixed(2)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 pr-4 text-muted-foreground">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
