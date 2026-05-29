import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/redux/store";
import { startVerification } from "@/redux/slices/authSlice";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password — Northstar" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email.");
    dispatch(startVerification({ email, flow: "forgot" }));
    toast.success("Code sent to " + email);
    navigate({ to: "/verify-email" });
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a 6-digit verification code."
      footer={<>Remembered? <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" required /></div>
        <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold press lift shadow-glow">Send verification code</button>
      </form>
    </AuthShell>
  );
}
