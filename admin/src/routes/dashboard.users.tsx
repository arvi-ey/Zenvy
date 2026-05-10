import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { users } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Users — Luxe Admin" }] }),
});

function UsersPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase())),
    [q]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">Customers, editors and admins</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="pl-9 rounded-xl max-w-md" />
      </div>

      <DataTable
        rows={filtered}
        columns={[
          { key: "name", header: "User", cell: (u) => (
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ) },
          { key: "role", header: "Role", cell: (u) => <StatusBadge status={u.role} /> },
          { key: "status", header: "Status", cell: (u) => <StatusBadge status={u.status} /> },
          { key: "orders", header: "Orders", cell: (u) => u.orders },
          { key: "joined", header: "Joined", cell: (u) => <span className="text-muted-foreground">{u.joined}</span> },
          { key: "actions", header: "", cell: (u) => (
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => toast.success(`Viewing ${u.name}`)}>View</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => toast.success(`${u.status === "Banned" ? "Unbanned" : "Banned"} ${u.name}`)}>
                  {u.status === "Banned" ? "Unban" : "Ban"}
                </Button>
              </div>
            ), className: "text-right" },
        ]}
      />
    </div>
  );
}
