import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setMode, setAccent, ThemeAccent, ThemeMode } from "@/redux/slices/themeSlice";
import { MenuKey, setBusinessName, setCurrency, setTimezone, toggleMenu } from "@/redux/slices/settingsSlice";
import { menuItems } from "@/constants";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings/")({
  head: () => ({ meta: [{ title: "Settings — Northstar" }] }),
  component: SettingsPage,
});

const ACCENTS: { value: ThemeAccent; color: string; label: string }[] = [
  { value: "indigo", color: "oklch(0.52 0.22 274)", label: "Indigo" },
  { value: "violet", color: "oklch(0.55 0.24 295)", label: "Violet" },
  { value: "fuchsia", color: "oklch(0.6 0.27 330)", label: "Fuchsia" },
  { value: "rose", color: "oklch(0.62 0.22 15)", label: "Rose" },
  { value: "crimson", color: "oklch(0.52 0.23 25)", label: "Crimson" },
  { value: "sunset", color: "oklch(0.67 0.2 40)", label: "Sunset" },
  { value: "amber", color: "oklch(0.76 0.16 80)", label: "Amber" },
  { value: "lime", color: "oklch(0.78 0.2 130)", label: "Lime" },
  { value: "emerald", color: "oklch(0.62 0.16 160)", label: "Emerald" },
  { value: "teal", color: "oklch(0.62 0.12 195)", label: "Teal" },
  { value: "cyan", color: "oklch(0.65 0.14 215)", label: "Cyan" },
  { value: "slate", color: "oklch(0.45 0.04 260)", label: "Slate" },
];

function SettingsPage() {
  const dispatch = useAppDispatch();
  const { mode, accent } = useAppSelector((s) => s.theme);
  const settings = useAppSelector((s) => s.settings);
  const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div>
      <PageHeader title="Settings" description="Adapt Northstar to your business — visibility, branding, and theme." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Theme" description="Switch between light, dark, or follow system.">
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => (
              <button key={m.value} onClick={() => dispatch(setMode(m.value))} className={cn("h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 press lift", mode === m.value ? "border-primary bg-primary/5 text-primary shadow-glow" : "border-border hover:bg-accent")}>
                <m.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Accent color</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button key={a.value} onClick={() => dispatch(setAccent(a.value))} className={cn("h-10 px-3 inline-flex items-center gap-2 rounded-lg border press", accent === a.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent")}>
                  <span className="h-4 w-4 rounded-full" style={{ background: a.color }} />
                  <span className="text-sm font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Menu visibility" description="Show or hide modules in the sidebar — adapt the dashboard to your business.">
          <div className="space-y-2">
            {menuItems.map((m) => (
              <label key={m.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-accent/30">
                <span className="text-sm font-medium">{m.label}</span>
                <Switch checked={settings.menuVisibility[m.key as MenuKey]} onCheckedChange={() => dispatch(toggleMenu(m.key as MenuKey))} />
              </label>
            ))}
          </div>
        </Card>

        <Card title="General" description="Business preferences and defaults." className="lg:col-span-2">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label>Business name</Label><Input value={settings.businessName} onChange={(e) => dispatch(setBusinessName(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Currency</Label>
              <Select value={settings.currency} onValueChange={(v) => dispatch(setCurrency(v as any))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD", "EUR", "GBP", "INR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => dispatch(setTimezone(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["UTC-08:00", "UTC-05:00", "UTC+00:00", "UTC+01:00", "UTC+05:30", "UTC+08:00"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button onClick={() => toast.success("Preferences saved")} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow">Save preferences</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-soft", className)}>
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
