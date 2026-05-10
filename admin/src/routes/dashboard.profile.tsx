import { createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Luxe Admin" }] }),
});

function ProfilePage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="rounded-2xl glass shadow-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative">
          <div className="size-20 rounded-2xl gradient-primary grid place-items-center text-primary-foreground text-2xl font-display font-semibold shadow-glow">
            AL
          </div>
          <button className="absolute -bottom-1.5 -right-1.5 size-8 rounded-full bg-card border border-border grid place-items-center shadow-card">
            <Camera className="size-4" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold">Alex Lin</h2>
          <p className="text-sm text-muted-foreground">alex@luxe.com · Admin</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="rounded-xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="prefs">Preferences</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <div className="rounded-2xl glass shadow-card p-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>First name</Label><Input defaultValue="Alex" className="rounded-xl" /></div>
              <div className="grid gap-1.5"><Label>Last name</Label><Input defaultValue="Lin" className="rounded-xl" /></div>
            </div>
            <div className="grid gap-1.5"><Label>Email</Label><Input defaultValue="alex@luxe.com" className="rounded-xl" /></div>
            <div className="grid gap-1.5"><Label>Bio</Label><Input defaultValue="Building a beautiful commerce." className="rounded-xl" /></div>
            <Button onClick={() => toast.success("Profile updated")} className="gradient-primary text-primary-foreground border-0 rounded-xl">
              Save changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="rounded-2xl glass shadow-card p-6 space-y-4 max-w-2xl">
            <div className="grid gap-1.5"><Label>Current password</Label><Input type="password" className="rounded-xl" /></div>
            <div className="grid gap-1.5"><Label>New password</Label><Input type="password" className="rounded-xl" /></div>
            <div className="grid gap-1.5"><Label>Confirm new password</Label><Input type="password" className="rounded-xl" /></div>
            <div className="flex items-center justify-between rounded-xl bg-accent/30 p-4">
              <div><p className="font-medium">Two-factor authentication</p><p className="text-xs text-muted-foreground">Extra layer of security</p></div>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => toast.success("Password updated")} className="gradient-primary text-primary-foreground border-0 rounded-xl">
              Update password
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="prefs" className="mt-4">
          <div className="rounded-2xl glass shadow-card p-6 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Dark mode</p><p className="text-xs text-muted-foreground">Persisted across sessions</p></div>
              <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Email notifications</p><p className="text-xs text-muted-foreground">Order updates and digests</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Push notifications</p><p className="text-xs text-muted-foreground">Important alerts</p></div>
              <Switch defaultChecked />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="rounded-2xl glass shadow-card p-6 space-y-4 max-w-2xl">
            {["Logged in from Chrome · macOS", "Updated product Aurora Linen Shirt", "Banned user Liam Carter", "Sent push notification to all users"].map((a, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
                <p className="text-sm">{a}</p>
                <span className="text-xs text-muted-foreground">{i + 1}h ago</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
