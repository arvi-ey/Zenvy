import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignUp,
  head: () => ({ meta: [{ title: "Sign up — Luxe Admin" }] }),
});

function SignUp() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || form.password.length < 6) return toast.error("Please complete the form (min 6-char password)");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    }, 900);
  };

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl glass shadow-glow p-8 sm:p-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Luxe</span>
        </Link>

        <h1 className="text-3xl font-display font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start managing your store in minutes</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-1.5">
            <Label>Full name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl h-11" placeholder="Alex Lin" />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl h-11" placeholder="alex@luxe.com" />
          </div>
          <div className="grid gap-1.5">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl h-11" placeholder="••••••••" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl text-base font-medium">
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/signin" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
