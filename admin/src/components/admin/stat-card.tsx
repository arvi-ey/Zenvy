import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  index?: number;
}

export function StatCard({ label, value, delta, icon: Icon, index = 0 }: StatCardProps) {
  const positive = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl glass shadow-card p-5 group"
    >
      <div className="absolute -right-10 -top-10 size-40 rounded-full gradient-primary opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl sm:text-3xl font-display font-semibold">{value}</p>
        </div>
        <div className="size-11 rounded-xl gradient-primary grid place-items-center shadow-glow shrink-0">
          <Icon className="size-5 text-primary-foreground" />
        </div>
      </div>
      <div className={cn("mt-4 flex items-center gap-1.5 text-sm", positive ? "text-success" : "text-destructive")}>
        {positive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        <span className="font-medium">{positive ? "+" : ""}{delta}%</span>
        <span className="text-muted-foreground">vs last month</span>
      </div>
    </motion.div>
  );
}
