import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  accent?: "primary" | "gold" | "success" | "destructive";
}

export function StatCard({ label, value, delta, icon: Icon, accent = "primary" }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="lift relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-10 blur-2xl"
           style={{ background: accent === "gold" ? "var(--gradient-gold)" : "var(--gradient-primary)" }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground",
          accent === "gold" ? "bg-gradient-gold" : "bg-gradient-primary")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold",
            positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}{delta}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
