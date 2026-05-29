import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { clearFlow, signIn } from "@/redux/slices/authSlice";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify your email — Northstar" }] }),
  component: Verify,
});

function Verify() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pendingEmail, flow } = useAppSelector((s) => s.auth);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(45);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (!pendingEmail) navigate({ to: "/signin" }); }, [pendingEmail, navigate]);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  function set(i: number, v: string) {
    const n = v.replace(/\D/g, "").slice(-1);
    const arr = [...digits]; arr[i] = n; setDigits(arr);
    if (n && i < 5) refs.current[i + 1]?.focus();
  }
  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }
  function onPaste(e: React.ClipboardEvent) {
    const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (v.length) { setDigits(v.split("").concat(Array(6 - v.length).fill(""))); e.preventDefault(); }
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (digits.some((d) => !d)) return toast.error("Enter all 6 digits.");
    if (flow === "forgot") {
      navigate({ to: "/reset-password" });
    } else {
      dispatch(signIn({ email: pendingEmail! }));
      dispatch(clearFlow());
      toast.success("Email verified");
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <AuthShell title="Verify your email" subtitle={`We sent a 6-digit code to ${pendingEmail ?? "your inbox"}.`}>
      <form onSubmit={verify} className="space-y-5">
        <div className="flex gap-2 justify-between" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 text-center text-xl font-semibold rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition-all"
            />
          ))}
        </div>
        <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold press lift shadow-glow">Verify & continue</button>
        <p className="text-center text-sm text-muted-foreground">
          {timer > 0 ? (
            <>Resend code in <span className="font-medium text-foreground">{timer}s</span></>
          ) : (
            <button type="button" onClick={() => { setTimer(45); toast.success("New code sent"); }} className="text-primary hover:underline">Resend code</button>
          )}
        </p>
      </form>
    </AuthShell>
  );
}
