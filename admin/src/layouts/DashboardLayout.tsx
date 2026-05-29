import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { RequireAuth } from "@/components/RequireAuth";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <RequireAuth>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 page-enter">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
