import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { signIn } from "@/redux/slices/authSlice";
import { toast } from "sonner";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in — Northstar" }] }),
  component: SignIn,
});

function SignIn() {
  const [email, setEmail] = useState("admin@northstar.io");
  const [password, setPassword] = useState("••••••••");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email.");
    setLoading(true);
    setTimeout(() => {
      dispatch(signIn({ email }));
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    }, 600);
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Northstar workspace."
      footer={<>Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Create one</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-11" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-10" required />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox defaultChecked /> Remember me for 30 days
        </label>
        <button disabled={loading} className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold press lift shadow-glow disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
