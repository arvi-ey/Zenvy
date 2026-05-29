import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { useAppSelector } from "@/redux/store";
import { AppUser } from "@/redux/slices/usersSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/users/")({
  head: () => ({ meta: [{ title: "Users — Northstar" }] }),
  component: UsersPage,
});

function UsersPage() {
  const users = useAppSelector((s) => s.users.list);
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewing, setViewing] = useState<AppUser | null>(null);

  const filtered = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const columns: Column<AppUser>[] = [
    { key: "name", header: "Name", sortable: true, render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">{u.name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
        <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
      </div>
    ) },
    { key: "role", header: "Role", sortable: true, render: (u) => <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted">{u.role}</span> },
    { key: "country", header: "Country", sortable: true },
    { key: "spend", header: "Lifetime spend", sortable: true, render: (u) => <span className="tabular-nums font-medium">${u.spend.toLocaleString()}</span> },
    { key: "status", header: "Status", render: (u) => <StatusPill status={u.status} /> },
    { key: "joined", header: "Joined", sortable: true, render: (u) => new Date(u.joined).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="All customers and team members across your workspace."
        actions={
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {["Admin", "Manager", "Customer", "Support"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <DataTable data={filtered} columns={columns} searchKeys={["name", "email", "country"]} rowKey={(u) => u.id} onRowClick={(u) => setViewing(u)} />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <Row label="Email" value={viewing.email} />
              <Row label="Role" value={viewing.role} />
              <Row label="Country" value={viewing.country} />
              <Row label="Status" value={<StatusPill status={viewing.status} />} />
              <Row label="Lifetime spend" value={`$${viewing.spend.toLocaleString()}`} />
              <Row label="Joined" value={new Date(viewing.joined).toLocaleString()} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between border-b border-border py-2"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
