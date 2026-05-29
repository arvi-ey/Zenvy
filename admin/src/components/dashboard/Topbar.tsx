import { Menu, Search, Bell, Sun, Moon, Monitor, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setMode, ThemeMode } from "@/redux/slices/themeSlice";
import { signOut } from "@/redux/slices/authSlice";
import { useNavigate } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = useAppSelector((s) => s.theme.mode);
  const profile = useAppSelector((s) => s.profile);
  const business = useAppSelector((s) => s.settings.businessName);

  const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border glass">
      <button className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent press" onClick={onMobileMenu}>
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search orders, users, items…"
            className="w-full h-10 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-ring outline-none pl-9 pr-16 text-sm transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="hidden sm:flex items-center rounded-lg bg-muted/60 p-0.5">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => dispatch(setMode(m.value))}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors",
                mode === m.value && "bg-background text-foreground shadow-soft"
              )}
              title={m.label}
              aria-label={m.label}
            >
              <m.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent press">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary anim-pulse-glow" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              ["New order ORD-10287", "Olivia Bennett • $1,420.50", "2m"],
              ["Inventory low: Aurora Headset", "Stock at 12 units", "1h"],
              ["Win-back campaign queued", "Email • 4,210 recipients", "3h"],
            ].map(([t, s, time]) => (
              <DropdownMenuItem key={t} className="flex flex-col items-start py-2.5">
                <div className="flex w-full items-center justify-between"><span className="text-sm font-medium">{t}</span><span className="text-[10px] text-muted-foreground">{time}</span></div>
                <span className="text-xs text-muted-foreground">{s}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1.5 pr-2.5 h-10 rounded-full hover:bg-accent press">
              <Avatar className="h-7 w-7">
                {profile.avatar && <AvatarImage src={profile.avatar} />}
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
              </Avatar>
              <span className="hidden md:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold">{profile.firstName} {profile.lastName}</span>
                <span className="text-[10px] text-muted-foreground">{business}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/profile" })}><User className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}><SettingsIcon className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { dispatch(signOut()); navigate({ to: "/signin" }); }} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
