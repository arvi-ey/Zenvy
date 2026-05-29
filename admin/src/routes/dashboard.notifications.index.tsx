import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addNotification, deleteNotification, NotificationItem, updateNotification } from "@/redux/slices/notificationsSlice";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageCircle, Plus, Pencil, Trash2, Send, FileText } from "lucide-react";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/notifications/")({
  head: () => ({ meta: [{ title: "Notifications — Northstar" }] }),
  component: NotificationsPage,
});

const TEMPLATES = [
  { name: "Order shipped", body: "Hi {{name}}, your order {{id}} has just shipped via DHL Express. Track it here: {{link}}" },
  { name: "Welcome", body: "Welcome to Northstar, {{name}}! Here's a 10% off code for your first order: WELCOME10" },
  { name: "Win-back", body: "We've missed you, {{name}}. Come back for an exclusive 15% off — today only." },
];

function NotificationsPage() {
  const list = useAppSelector((s) => s.notifications.list);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationItem | null>(null);
  const blank = { title: "", message: "", channel: "email" as NotificationItem["channel"], audience: "All Customers", status: "draft" as NotificationItem["status"] };
  const [form, setForm] = useState(blank);

  function save() {
    if (!form.title || !form.message) return toast.error("Title and message required.");
    if (editing) { dispatch(updateNotification({ ...editing, ...form })); toast.success("Updated"); }
    else { dispatch(addNotification(form)); toast.success("Created"); }
    setOpen(false); setEditing(null); setForm(blank);
  }

  function applyTemplate(t: typeof TEMPLATES[number]) {
    setForm((f) => ({ ...f, title: t.name, message: t.body }));
  }

  return (
    <div>
      <PageHeader
        title="Send Notifications"
        description="Reach customers across email and WhatsApp with personalized campaigns."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(blank); } }}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow"><Plus className="h-4 w-4" /> Compose</button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader><DialogTitle>{editing ? "Edit notification" : "Compose notification"}</DialogTitle></DialogHeader>
              <div className="grid lg:grid-cols-[1fr_220px] gap-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Channel</Label>
                      <div className="flex gap-2">
                        <ChannelBtn active={form.channel === "email"} onClick={() => setForm({ ...form, channel: "email" })} icon={<Mail className="h-4 w-4" />} label="Email" />
                        <ChannelBtn active={form.channel === "whatsapp"} onClick={() => setForm({ ...form, channel: "whatsapp" })} icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" />
                      </div>
                    </div>
                    <div className="space-y-1.5"><Label>Audience</Label>
                      <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["All Customers", "Active Orders", "Dormant 90d+", "VIP", "Trial Users"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label>Subject / title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Message</Label><Textarea rows={9} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Use {{name}}, {{id}}, {{link}} for personalization." /></div>
                  <div className="space-y-1.5"><Label>Send mode</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as NotificationItem["status"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Save as draft</SelectItem>
                        <SelectItem value="scheduled">Schedule</SelectItem>
                        <SelectItem value="sent">Send now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Templates</Label>
                  <div className="space-y-1.5">
                    {TEMPLATES.map((t) => (
                      <button key={t.name} onClick={() => applyTemplate(t)} className="w-full text-left rounded-lg border border-border p-3 hover:border-primary hover:bg-accent/40 press">
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.body}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md border border-border text-sm">Cancel</button>
                <button onClick={save} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold"><Send className="h-4 w-4" /> {editing ? "Save" : form.status === "sent" ? "Send" : "Create"}</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {list.map((n) => (
          <div key={n.id} className="lift rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("h-8 w-8 rounded-lg flex items-center justify-center", n.channel === "email" ? "bg-primary/15 text-primary" : "bg-success/15 text-success")}>
                  {n.channel === "email" ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                </span>
                <StatusPill status={n.status} />
              </div>
              <div className="flex">
                <button onClick={() => { setEditing(n); setForm({ title: n.title, message: n.message, channel: n.channel, audience: n.audience, status: n.status }); setOpen(true); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent press"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { dispatch(deleteNotification(n.id)); toast.success("Deleted"); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive press"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="mt-3 font-semibold">{n.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{n.message}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{n.audience}</span>
              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium press", active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent")}>
      {icon} {label}
    </button>
  );
}
