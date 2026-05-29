import { Link, useRouterState } from "@tanstack/react-router";
import { useAppSelector } from "@/redux/store";
import { menuItems } from "@/constants";
import { BrandMark } from "@/components/BrandMark";
import {
  LayoutDashboard, ShoppingBag, Users, Package, FolderTree,
  Bell, Settings, UserCircle, ChevronLeft, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { LayoutDashboard, ShoppingBag, Users, Package, FolderTree, Bell, Settings, UserCircle };

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: Props) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const visibility = useAppSelector((s) => s.settings.menuVisibility);
  const visible = menuItems.filter((m) => visibility[m.key]);

  const content = (
    <>
      <div className={cn("flex items-center justify-between px-4 h-16 border-b border-sidebar-border", collapsed && "px-3")}>
        <BrandMark collapsed={collapsed} />
        <button onClick={onToggle} className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent press">
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 stagger">
        <div className={cn("text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/40 px-2 mb-2", collapsed && "opacity-0")}>Workspace</div>
        {visible.map((m) => {
          const Icon = ICONS[m.icon as keyof typeof ICONS];
          const active = m.path === "/dashboard" ? path === "/dashboard" : path.startsWith(m.path);
          return (
            <Link
              key={m.key}
              to={m.path}
              onClick={onClose}
              className={cn(
                "sidebar-item relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-sidebar-foreground",
                collapsed && "justify-center"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-primary shadow-glow" />}
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span>{m.label}</span>}
              {!collapsed && m.key === "notifications" && (
                <span className="ml-auto rounded-full bg-primary/15 text-primary text-[10px] px-1.5 py-0.5 font-semibold">3</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 border border-sidebar-border">
          <Sparkles className="h-4 w-4 text-[hsl(var(--gold))]" style={{ color: "var(--gold)" }} />
          <p className="mt-2 text-sm font-semibold text-sidebar-foreground">Upgrade to Atlas</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">Unlock AI insights, dedicated success & SLA-backed uptime.</p>
          <button className="mt-3 w-full rounded-md bg-primary text-primary-foreground text-xs font-semibold py-2 press lift">View plans</button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sidebar-shell hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 z-30",
          collapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      <div className={cn("lg:hidden fixed inset-0 z-50 transition-opacity", mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <aside className={cn("absolute left-0 top-0 h-full w-[280px] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-transform duration-300", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          {content}
        </aside>
      </div>
    </>
  );
}
