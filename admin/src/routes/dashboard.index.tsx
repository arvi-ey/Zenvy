import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  DollarSign, MousePointerClick, Users, Target, CalendarDays, Megaphone, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { marketingTrend, channelPerformance, audienceGrowth, channelSplit, conversionFunnel, topCampaigns } from "@/constants/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Marketing Overview — Zenvy" }] }),
  component: MarketingDashboard,
});

const RANGES = ["Today", "7 Days", "30 Days", "90 Days", "Custom"] as const;
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function MarketingDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("30 Days");

  return (
    <div>
      <PageHeader
        title="Marketing Overview"
        description="Track spend, channels, campaigns and pipeline across every touchpoint."
        actions={
          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  range === r ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "Custom" && <CalendarDays className="h-3 w-3" />} {r}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard label="Marketing Spend" value="$56,120" delta={8.4} icon={DollarSign} />
        <StatCard label="Attributed Revenue" value="$330,100" delta={22.1} icon={TrendingUp} accent="gold" />
        <StatCard label="Blended ROAS" value="5.88x" delta={12.7} icon={Target} />
        <StatCard label="New Leads" value="14,208" delta={9.1} icon={Users} accent="gold" />
      </div>

      {/* Secondary KPIs */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="CTR" value="3.42%" hint="+0.31 pts" positive />
        <MiniStat label="CPC" value="$0.82" hint="−$0.06" positive />
        <MiniStat label="CAC" value="$24.60" hint="−5.2%" positive />
        <MiniStat label="Conv. Rate" value="4.71%" hint="+0.4 pts" positive />
      </div>

      {/* Main charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Spend vs Revenue" subtitle="Monthly attributed performance" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={marketingTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spd" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#rev)" strokeWidth={2} />
              <Area type="monotone" dataKey="spend" stroke="var(--chart-2)" fill="url(#spd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Traffic mix" subtitle="Source attribution this period">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {channelSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Channel ROAS & audience */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="ROAS by channel" subtitle="Return on ad spend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="channel" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v}x`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(v: number) => `${v}x`} />
              <Bar dataKey="roas" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Audience growth" subtitle="Followers vs subscribers">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={audienceGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="followers" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="subscribers" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Funnel + Top campaigns */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Marketing funnel" subtitle="From impression to customer">
          <div className="space-y-2 pt-2">
            {conversionFunnel.map((s, i) => (
              <div key={s.name} className="text-sm">
                <div className="flex justify-between text-muted-foreground"><span>{s.name}</span><span className="font-semibold text-foreground tabular-nums">{s.value}%</span></div>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-primary origin-left" style={{ width: `${s.value}%`, animation: `chart-rise .8s cubic-bezier(.2,.7,.2,1) ${i*0.08}s both`, transformOrigin: "left" }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Top campaigns</h3>
              <p className="text-xs text-muted-foreground">Best performers across all channels</p>
            </div>
            <span className="text-xs text-muted-foreground">{topCampaigns.length} active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left font-medium py-2 pr-3">Campaign</th>
                  <th className="text-left font-medium py-2 pr-3">Channel</th>
                  <th className="text-right font-medium py-2 pr-3">Impr.</th>
                  <th className="text-right font-medium py-2 pr-3">CTR</th>
                  <th className="text-right font-medium py-2 pr-3">Conv.</th>
                  <th className="text-right font-medium py-2">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="py-2.5 pr-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{c.id}</p>
                    </td>
                    <td className="py-2.5 pr-3"><span className="text-xs px-2 py-0.5 rounded-md bg-muted">{c.channel}</span></td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{c.impressions.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{c.ctr}%</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{c.conv}%</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-primary">{c.roas}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, hint, positive }: { label: string; value: string; hint: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <MousePointerClick className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
      <p className={cn("mt-0.5 text-xs", positive ? "text-success" : "text-destructive")}>{hint}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      <div className="mb-3">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
