import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = path.split("/").filter(Boolean);
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 glass px-4 sm:px-6">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <Menu className="size-5" />
      </Button>

      <nav className="hidden md:flex items-center text-sm text-muted-foreground gap-1.5">
        {crumbs.map((c, i) => (
          <span key={c} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-border">/</span>}
            <span className={i === crumbs.length - 1 ? "text-foreground font-medium capitalize" : "capitalize"}>{c}</span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anything…"
            className="pl-9 w-[220px] lg:w-[320px] bg-background/50 border-border/60 rounded-xl"
          />
        </div>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl pl-1 pr-3 py-1 hover:bg-accent/50 transition-colors">
              <Avatar className="size-8">
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">AL</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">Alex Lin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/dashboard/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/signin">Sign out</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
