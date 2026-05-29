import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bell, Boxes, ShieldCheck, Sparkles, Users, Zap, Globe2, Shirt, Truck, Tag } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zenvy — T-Shirt Commerce Admin" },
      { name: "description", content: "The all-in-one admin dashboard powering Zenvy — manage tees, inventory, orders and customers from one premium command center." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 lg:px-8 h-16">
          <BrandMark />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#collection" className="hover:text-foreground transition-colors">Collection</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/signin" className="hidden sm:inline-flex h-9 px-3 items-center text-sm font-medium hover:text-foreground text-muted-foreground">Sign in</Link>
            <Link to="/signup" className="inline-flex h-9 px-4 items-center rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow">Open dashboard</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 pt-20 pb-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground anim-fade-in">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} /> Zenvy Admin · Fall '26 drop is live
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] anim-fade-in-up">
            Run your tee brand <br className="hidden md:block" />
            <span className="text-gradient">from one command center</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto anim-fade-in-up" style={{ animationDelay: ".1s" }}>
            Zenvy is the operations dashboard for our t-shirt brand — manage drops, inventory, orders and customers with the polish of a flagship boutique.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 anim-fade-in-up" style={{ animationDelay: ".2s" }}>
            <Link to="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 text-sm font-semibold press lift shadow-glow">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-5 text-sm font-semibold hover:bg-accent press">See what's inside</a>
          </div>

          {/* Hero card mock */}
          <div className="relative mt-16 mx-auto max-w-5xl anim-scale-in" style={{ animationDelay: ".25s" }}>
            <div className="absolute -inset-1 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" />
            <div className="relative rounded-3xl border border-border bg-card shadow-elev overflow-hidden">
              <div className="grid grid-cols-12 gap-px bg-border">
                <div className="col-span-12 md:col-span-3 bg-sidebar text-sidebar-foreground p-5">
                  <BrandMark />
                  <div className="mt-6 space-y-1.5 text-sm">
                    {["Analytics", "Orders", "Customers", "Tees", "Notifications"].map((l, i) => (
                      <div key={l} className={`rounded-md px-3 py-2 ${i === 0 ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/60"}`}>{l}</div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-9 bg-background p-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      ["Revenue", "$284K", "+22.4%"],
                      ["Tees Sold", "8,402", "+14.1%"],
                      ["Customers", "21.7K", "+9.2%"],
                      ["Avg. Order", "$58.40", "+3.6%"],
                    ].map(([l, v, d]) => (
                      <div key={l} className="rounded-xl border border-border bg-card p-3 text-left">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">{v}</p>
                        <p className="text-[11px] text-success">{d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 h-40 rounded-xl border border-border bg-gradient-to-tr from-primary/15 via-transparent to-[oklch(0.79_0.13_85_/_0.18)] relative overflow-hidden">
                    <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.6" />
                          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 90 L40 70 L80 80 L120 50 L160 60 L200 30 L240 45 L280 20 L320 35 L360 10 L400 25 L400 120 L0 120 Z" fill="url(#g)" />
                      <path d="M0 90 L40 70 L80 80 L120 50 L160 60 L200 30 L240 45 L280 20 L320 35 L360 10 L400 25" stroke="var(--primary)" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection strip */}
      <section id="collection" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-muted-foreground/70">
          {["CLASSICS", "GRAPHIC", "VINTAGE", "OVERSIZED", "PREMIUM", "LIMITED"].map((l) => (
            <div key={l} className="text-center font-semibold tracking-[0.2em] text-sm">{l}</div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 lg:px-8 py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Operations</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Every drop, every order, one workspace.</h2>
          <p className="mt-3 text-muted-foreground">From print runs to fulfillment — Zenvy Admin keeps the entire t-shirt business in sync.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {[
            { icon: Shirt, title: "Catalog & Drops", body: "Manage tees, variants, SKUs and imagery with up to 3 product photos per item." },
            { icon: Boxes, title: "Inventory by Size", body: "Track stock across sizes and prints; low-stock alerts keep best-sellers live." },
            { icon: Truck, title: "Orders & Fulfillment", body: "End-to-end order lifecycle with smart status flows and shipping handoffs." },
            { icon: Users, title: "Customer 360", body: "Unified profiles, lifetime spend and segments across web and pop-ups." },
            { icon: BarChart3, title: "Realtime Analytics", body: "Revenue, AOV and category mix updated by the minute." },
            { icon: Tag, title: "Promos & Drops", body: "Schedule capsule launches and discount codes with one click." },
            { icon: Bell, title: "Omnichannel Comms", body: "Email + WhatsApp campaigns built for fashion-grade tone." },
            { icon: ShieldCheck, title: "Brand-grade Security", body: "Granular roles for designers, ops, support and finance." },
            { icon: Zap, title: "Fast by default", body: "Sub-second navigation across every screen of the admin." },
          ].map((f) => (
            <div key={f.title} className="lift rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border p-10 md:p-16 text-center bg-gradient-to-br from-primary/15 via-transparent to-[oklch(0.79_0.13_85_/_0.12)]">
          <Globe2 className="mx-auto h-10 w-10 text-primary anim-float" />
          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Built for the Zenvy team.</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Sign in to manage drops, orders and customers across every channel.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 text-sm font-semibold press lift shadow-glow">Open dashboard <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/signin" className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-5 text-sm font-semibold hover:bg-accent press">Sign in</Link>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <BrandMark />
          <p>© {new Date().getFullYear()} Zenvy T-Shirt Co. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
