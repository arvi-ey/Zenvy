import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { deliveries } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/deliveries")({
  component: DeliveriesPage,
  head: () => ({ meta: [{ title: "Deliveries — Luxe Admin" }] }),
});

const cards = [
  { label: "Delivered", value: 142, icon: CheckCircle2, accent: "text-success" },
  { label: "In Transit", value: 38, icon: Truck, accent: "text-accent" },
  { label: "Pending", value: 24, icon: Clock, accent: "text-warning" },
  { label: "Cancelled", value: 6, icon: XCircle, accent: "text-destructive" },
];

const timeline = [
  { time: "09:42", label: "Picked up from warehouse", status: "done" },
  { time: "11:15", label: "In transit to hub", status: "done" },
  { time: "14:30", label: "Out for delivery", status: "active" },
  { time: "—", label: "Delivered", status: "pending" },
];

function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Delivery tracking</h1>
        <p className="text-sm text-muted-foreground">Live shipping operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl glass shadow-card p-5 flex items-center gap-4">
            <div className={`size-12 rounded-xl bg-current/10 grid place-items-center ${c.accent}`}>
              <c.icon className="size-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-display font-semibold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl glass shadow-card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Active shipment · DLV-5012</h3>
          <ol className="relative border-l-2 border-border ml-3 space-y-5">
            {timeline.map((t, i) => (
              <li key={i} className="ml-6">
                <span className={`absolute -left-[9px] size-4 rounded-full border-2 border-background ${
                  t.status === "done" ? "bg-success" : t.status === "active" ? "bg-primary shadow-glow" : "bg-muted"
                }`} />
                <div className="flex items-center justify-between">
                  <p className="font-medium">{t.label}</p>
                  <span className="text-xs text-muted-foreground">{t.time}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl glass shadow-card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Driver</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold">MT</div>
            <div>
              <p className="font-medium">Marcus T.</p>
              <p className="text-xs text-muted-foreground">★ 4.92 · 1,204 deliveries</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span>EV Van · #X-1187</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ETA</span><span>2h 14m</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Distance</span><span>12.4 km</span></div>
          </div>
        </div>
      </div>

      <DataTable
        rows={deliveries}
        columns={[
          { key: "id", header: "Delivery", cell: (d) => <span className="font-medium">{d.id}</span> },
          { key: "order", header: "Order", cell: (d) => d.order },
          { key: "driver", header: "Driver", cell: (d) => d.driver },
          { key: "destination", header: "Destination", cell: (d) => <span className="text-muted-foreground">{d.destination}</span> },
          { key: "eta", header: "ETA", cell: (d) => d.eta },
          { key: "status", header: "Status", cell: (d) => <StatusBadge status={d.status} /> },
        ]}
      />
    </div>
  );
}
