import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { notifications } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — Luxe Admin" }] }),
});

function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const send = (channel: string) => {
    if (!title || !body) return toast.error("Please fill title and body");
    toast.success(`${channel} notification queued`);
    setTitle(""); setBody("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Reach your audience instantly</p>
      </div>

      <div className="rounded-2xl glass shadow-card p-6">
        <Tabs defaultValue="push">
          <TabsList className="rounded-xl">
            <TabsTrigger value="push">Push</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="schedule">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="space-y-3 mt-4">
            <div className="grid gap-1.5"><Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Flash sale starts now" className="rounded-xl" />
            </div>
            <div className="grid gap-1.5"><Label>Message</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Up to 40% off site-wide…" className="rounded-xl min-h-[100px]" />
            </div>
            <Button onClick={() => send("Push")} className="gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl">
              <Send className="size-4 mr-1.5" /> Send push
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-3 mt-4">
            <div className="grid gap-1.5"><Label>Subject</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your weekly digest" className="rounded-xl" />
            </div>
            <div className="grid gap-1.5"><Label>Body</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi there…" className="rounded-xl min-h-[140px]" />
            </div>
            <Button onClick={() => send("Email")} className="gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl">
              <Send className="size-4 mr-1.5" /> Send email
            </Button>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4 text-sm text-muted-foreground">
            Schedule a notification for later. Pick a date and audience to plan campaigns ahead of time.
          </TabsContent>
        </Tabs>
      </div>

      <DataTable
        rows={notifications}
        columns={[
          { key: "title", header: "Title", cell: (n) => <span className="font-medium">{n.title}</span> },
          { key: "channel", header: "Channel", cell: (n) => n.channel },
          { key: "audience", header: "Audience", cell: (n) => <span className="text-muted-foreground">{n.audience}</span> },
          { key: "status", header: "Status", cell: (n) => <StatusBadge status={n.status} /> },
          { key: "date", header: "Date", cell: (n) => <span className="text-muted-foreground">{n.date}</span> },
        ]}
      />
    </div>
  );
}
