import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Users, Bell, UserCog, Sparkles, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { to: "/dashboard/deliveries", label: "Deliveries", icon: Truck },
  { to: "/dashboard/users", label: "Users", icon: Users },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/profile", label: "Profile", icon: UserCog },
] as const;

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[78px]" : "w-[260px]"
      )}
    >
      <Link to="/" className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="size-9 rounded-xl gradient-primary grid place-items-center shadow-glow">
          <Sparkles className="size-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold">Luxe</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
          </div>
        )}
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((it) => {
          const active = path === it.to || (it.to !== "/dashboard" && path.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "text-sidebar-primary-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl gradient-primary shadow-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn("size-[18px] relative z-10", active && "text-primary-foreground")} />
              {!collapsed && <span className="relative z-10">{it.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/signin"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="size-[18px]" />
          {!collapsed && <span>Sign out</span>}
        </Link>
      </div>
    </aside>
  );
}
