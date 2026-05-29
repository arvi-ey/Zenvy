import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/redux/store";
import { clearFlow } from "@/redux/slices/authSlice";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — Northstar" }] }),
  component: Reset,
});

function Reset() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (p1.length < 8) return toast.error("Password must be 8+ characters.");
    if (p1 !== p2) return toast.error("Passwords don't match.");
    dispatch(clearFlow());
    toast.success("Password updated. Please sign in.");
    navigate({ to: "/signin" });
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something strong you'll remember.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={p1} onChange={(e) => setP1(e.target.value)} className="h-11" required /></div>
        <div className="space-y-1.5"><Label>Confirm password</Label><Input type="password" value={p2} onChange={(e) => setP2(e.target.value)} className="h-11" required /></div>
        <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold press lift shadow-glow">Update password</button>
      </form>
    </AuthShell>
  );
}
