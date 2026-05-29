import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  active: "bg-success/15 text-success",
  delivered: "bg-success/15 text-success",
  shipped: "bg-primary/15 text-primary",
  processing: "bg-warning/20 text-warning",
  pending: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
  refunded: "bg-destructive/15 text-destructive",
  invited: "bg-warning/20 text-warning",
  suspended: "bg-destructive/15 text-destructive",
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/15 text-primary",
  sent: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STYLES[status] ?? "bg-muted text-muted-foreground")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
