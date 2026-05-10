import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Paid: "bg-success/15 text-success border-success/30",
  Delivered: "bg-success/15 text-success border-success/30",
  Sent: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Processing: "bg-warning/15 text-warning border-warning/30",
  Scheduled: "bg-warning/15 text-warning border-warning/30",
  "In Transit": "bg-accent/15 text-accent border-accent/30",
  Shipped: "bg-accent/15 text-accent border-accent/30",
  Draft: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  Refunded: "bg-destructive/15 text-destructive border-destructive/30",
  Banned: "bg-destructive/15 text-destructive border-destructive/30",
  Admin: "bg-primary/15 text-primary border-primary/30",
  Editor: "bg-accent/15 text-accent border-accent/30",
  Customer: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
