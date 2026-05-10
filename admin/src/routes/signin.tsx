import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/signin")({
  component: SignIn,
  head: () => ({ meta: [{ title: "Sign in — Luxe Admin" }] }),
});

function SignIn() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("alex@luxe.com");
  const [password, setPassword] = useState("password");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    }, 900);
  };

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl glass shadow-glow p-8 sm:p-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Luxe</span>
        </Link>

        <h1 className="text-3xl font-display font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage your store</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl h-11" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl h-11 pr-10" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox defaultChecked /> <span>Remember me</span>
            </label>
            <Link to="/signin" className="text-primary hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl text-base font-medium">
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Luxe? <Link to="/signup" className="text-primary hover:underline font-medium">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}
