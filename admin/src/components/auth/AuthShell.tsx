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

        </div>
        <div className="relative grid grid-cols-3 gap-4 text-center">

        </div>
      </aside>

      {/* Form side */}

    </div>
  );
}
