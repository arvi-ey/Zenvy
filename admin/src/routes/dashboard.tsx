import { useState } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({ meta: [{ title: "Dashboard — Luxe Admin" }] }),
});

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
