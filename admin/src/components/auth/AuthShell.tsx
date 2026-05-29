import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandMark";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 bg-sidebar text-sidebar-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(800px 500px at 20% 20%, oklch(0.52 0.22 274 / 0.4), transparent 60%), radial-gradient(600px 400px at 80% 80%, oklch(0.79 0.13 85 / 0.2), transparent 60%)" }} />
        <div className="relative">
          <BrandMark />
        </div>
        <div className="relative space-y-6">
          <blockquote className="text-2xl font-medium leading-snug tracking-tight">
            "Northstar replaced six tools and gave our ops team a single source of truth. The polish makes it feel like software our customers would pay for."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-gold" />
            <div>
              <p className="text-sm font-semibold">Mira Chen</p>
              <p className="text-xs text-sidebar-foreground/60">VP Operations, Helix Industries</p>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-center">
          {[["$4.2B", "GMV processed"], ["99.99%", "Uptime SLA"], ["120+", "Countries"]].map(([v, l]) => (
            <div key={l}>
              <p className="text-xl font-semibold">{v}</p>
              <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">{l}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><BrandMark /></div>
          <div className="anim-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-sm text-center text-muted-foreground">{footer}</div>}
          </div>
          <p className="mt-10 text-xs text-center text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
