import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addOrder, deleteOrder, Order, OrderStatus } from "@/redux/slices/ordersSlice";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/orders/")({
  head: () => ({ meta: [{ title: "Orders — Northstar" }] }),
  component: OrdersPage,
});

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

function OrdersPage() {
  const orders = useAppSelector((s) => s.orders.list);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", email: "", amount: "", items: "1", status: "pending" as OrderStatus, paymentMethod: "Visa •• 4242", shippingAddress: "" });

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const columns: Column<Order>[] = [
    { key: "id", header: "Order", sortable: true, render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "customer", header: "Customer", sortable: true, render: (r) => (
      <div><p className="font-medium">{r.customer}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
    ) },
    { key: "amount", header: "Amount", sortable: true, render: (r) => <span className="font-semibold tabular-nums">${r.amount.toLocaleString()}</span> },
    { key: "items", header: "Items", sortable: true },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "createdAt", header: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", header: "", render: (r) => (
      <button onClick={(e) => { e.stopPropagation(); dispatch(deleteOrder(r.id)); toast.success("Order deleted"); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive press">
        <Trash2 className="h-4 w-4" />
      </button>
    ) },
  ];

  function create() {
    if (!form.customer || !form.email || !form.amount) return toast.error("Fill required fields.");
    dispatch(addOrder({ ...form, amount: Number(form.amount), items: Number(form.items) }));
    toast.success("Order created");
    setOpen(false);
    setForm({ customer: "", email: "", amount: "", items: "1", status: "pending", paymentMethod: "Visa •• 4242", shippingAddress: "" });
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage every order through its full lifecycle."
        actions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow"><Plus className="h-4 w-4" /> Add order</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create order</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label>Customer</Label><Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></div>
                  <div className="col-span-2 space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Items</Label><Input type="number" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as OrderStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Payment</Label><Input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /></div>
                  <div className="col-span-2 space-y-1.5"><Label>Shipping address</Label><Input value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md border border-border text-sm">Cancel</button>
                  <button onClick={create} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold">Create order</button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={["id", "customer", "email"]}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate({ to: "/dashboard/orders/$orderId", params: { orderId: r.id } })}
      />
    </div>
  );
}
