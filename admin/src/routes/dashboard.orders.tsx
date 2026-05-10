import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { orders } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Orders — Luxe Admin" }] }),
});

function OrdersPage() {
  const [q, setQ] = useState("");
  const [s, setS] = useState("all");

  const filtered = useMemo(
    () => orders.filter((o) =>
      (s === "all" || o.status === s) &&
      (o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase()))
    ),
    [q, s]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">Track every transaction</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: orders.length, color: "gradient-primary" },
          { label: "Processing", value: orders.filter((o) => o.status === "Processing").length, color: "bg-warning/20" },
          { label: "Shipped", value: orders.filter((o) => o.status === "Shipped").length, color: "bg-accent/20" },
          { label: "Delivered", value: orders.filter((o) => o.status === "Delivered").length, color: "bg-success/20" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass shadow-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-display font-semibold">{s.value}</p>
              <div className={`size-10 rounded-xl ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders…" className="pl-9 rounded-xl" />
        </div>
        <Select value={s} onValueChange={setS}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        rows={filtered}
        columns={[
          { key: "id", header: "Order", cell: (o) => <span className="font-medium">{o.id}</span> },
          { key: "customer", header: "Customer", cell: (o) => (
              <div><p className="font-medium">{o.customer}</p><p className="text-xs text-muted-foreground">{o.email}</p></div>
            ) },
          { key: "total", header: "Total", cell: (o) => <span className="font-medium">${o.total.toFixed(2)}</span> },
          { key: "payment", header: "Payment", cell: (o) => <StatusBadge status={o.payment} /> },
          { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
          { key: "date", header: "Date", cell: (o) => <span className="text-muted-foreground">{o.date}</span> },
        ]}
      />
    </div>
  );
}
