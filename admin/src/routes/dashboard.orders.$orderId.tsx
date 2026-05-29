import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateOrder, OrderStatus, deleteOrder } from "@/redux/slices/ordersSlice";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, Receipt, CreditCard, Truck, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/orders/$orderId")({
  head: () => ({ meta: [{ title: "Order details — Northstar" }] }),
  component: OrderDetails,
});

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

function OrderDetails() {
  const { orderId } = Route.useParams();
  const order = useAppSelector((s) => s.orders.list.find((o) => o.id === orderId));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(order);

  useEffect(() => { setDraft(order); }, [order]);

  if (!order || !draft) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Order not found.</p>
        <button onClick={() => navigate({ to: "/dashboard/orders" })} className="mt-3 text-primary hover:underline text-sm">Back to orders</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate({ to: "/dashboard/orders" })} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <PageHeader
        title={`Order ${order.id}`}
        description={`Placed ${new Date(order.createdAt).toLocaleString()} • ${order.items} items`}
        actions={
          <>
            <StatusPill status={draft.status} />
            <button onClick={() => { dispatch(deleteOrder(order.id)); toast.success("Deleted"); navigate({ to: "/dashboard/orders" }); }} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border text-destructive text-sm hover:bg-destructive/10 press">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button onClick={() => { dispatch(updateOrder(draft)); toast.success("Saved"); }} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow">
              <Save className="h-4 w-4" /> Save changes
            </button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4"><Receipt className="h-4 w-4 text-primary" /><h3 className="font-semibold">Order details</h3></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Customer"><Input value={draft.customer} onChange={(e) => setDraft({ ...draft, customer: e.target.value })} /></Field>
              <Field label="Email"><Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
              <Field label="Amount ($)"><Input type="number" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} /></Field>
              <Field label="Items"><Input type="number" value={draft.items} onChange={(e) => setDraft({ ...draft, items: Number(e.target.value) })} /></Field>
              <Field label="Status">
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as OrderStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Payment method"><Input value={draft.paymentMethod} onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Shipping address"><Input value={draft.shippingAddress} onChange={(e) => setDraft({ ...draft, shippingAddress: e.target.value })} /></Field></div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-semibold mb-3">Order timeline</h3>
            <div className="space-y-3">
              {[
                ["Order placed", new Date(order.createdAt).toLocaleString()],
                ["Payment confirmed", new Date(Date.now() - 3600000).toLocaleString()],
                ["Awaiting fulfillment", new Date(Date.now() - 1800000).toLocaleString()],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary anim-pulse-glow" />
                  <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <SidePanel icon={<CreditCard className="h-4 w-4" />} title="Payment">
            <div className="text-sm space-y-1">
              <p className="font-semibold tabular-nums text-lg">${draft.amount.toLocaleString()}</p>
              <p className="text-muted-foreground">{draft.paymentMethod}</p>
            </div>
          </SidePanel>
          <SidePanel icon={<Truck className="h-4 w-4" />} title="Fulfillment">
            <p className="text-sm text-muted-foreground">{draft.items} items • DHL Express</p>
            <p className="text-xs text-muted-foreground mt-1">ETA in 2–4 business days</p>
          </SidePanel>
          <SidePanel icon={<MapPin className="h-4 w-4" />} title="Ship to">
            <p className="text-sm">{draft.customer}</p>
            <p className="text-xs text-muted-foreground mt-1">{draft.shippingAddress}</p>
          </SidePanel>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function SidePanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-3 text-primary">{icon}<h4 className="font-semibold text-foreground">{title}</h4></div>
      {children}
    </div>
  );
}
