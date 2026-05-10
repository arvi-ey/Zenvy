import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Bell, Package, Shield, Sparkles, Star, Truck, Users } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Luxe — Premium E-Commerce Admin Dashboard" },
      { name: "description", content: "A modern, luxury admin dashboard for ambitious commerce teams. Analytics, orders, deliveries, and more." },
      { property: "og:title", content: "Luxe — Premium E-Commerce Admin Dashboard" },
      { property: "og:description", content: "Run your store with a beautiful, fast, premium admin experience." },
    ],
  }),
});

const features = [
  { icon: BarChart3, title: "Realtime analytics", desc: "Beautiful charts that reveal trends and revenue at a glance." },
  { icon: Package, title: "Catalog control", desc: "Add, edit and organize products with effortless precision." },
  { icon: Truck, title: "Delivery tracking", desc: "Live shipping timelines, drivers, and on-time performance." },
  { icon: Users, title: "Customer insights", desc: "Roles, segments and behavior — all in one place." },
  { icon: Bell, title: "Notifications", desc: "Send push, email and scheduled campaigns instantly." },
  { icon: Shield, title: "Enterprise security", desc: "2FA, audit logs and role-based permissions out of the box." },
];

const stats = [
  { v: "$2.4B+", l: "GMV processed" },
  { v: "12,000+", l: "Stores" },
  { v: "99.99%", l: "Uptime" },
  { v: "120ms", l: "Avg. response" },
];

const testimonials = [
  { name: "Amelia Park", role: "COO, Halcyon Goods", quote: "Luxe transformed how we run operations. It's the most beautiful admin we've ever shipped to our team." },
  { name: "Noah Bennett", role: "Founder, Cirrus", quote: "From product to delivery, every workflow feels considered. Our team simply loves using it." },
  { name: "Sofia Reyes", role: "Head of Growth, Mira", quote: "The analytics alone are worth it. We make better decisions, faster." },
];

function Home() {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">Luxe</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Numbers</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/signin">Sign in</Link></Button>
            <Button asChild className="gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative aurora-bg overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 lg:py-36 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-wider">
            <Sparkles className="size-3.5 text-primary" /> New · v2.0 launching
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-display font-semibold leading-[1.05] tracking-tight">
            The premium admin <br />for <span className="gradient-text">modern commerce</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Run your store from a single, beautiful workspace. Analytics, orders, deliveries, and customers — designed to feel effortless.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl h-12 px-7">
              <Link to="/dashboard">Explore dashboard <ArrowRight className="size-4 ml-1.5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl h-12 px-7 glass">
              <Link to="/signup">Create free account</Link>
            </Button>
          </motion.div>

          {/* Hero preview card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-16 mx-auto max-w-5xl rounded-3xl glass shadow-glow p-2 sm:p-3">
            <div className="rounded-2xl bg-card/80 border border-border/60 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground">luxe.app/dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4 sm:p-6">
                {[
                  { l: "Revenue", v: "$382K", d: "+12%" },
                  { l: "Orders", v: "6,820", d: "+8%" },
                  { l: "Customers", v: "14.3K", d: "+4%" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-background/60 border border-border/60 p-3 sm:p-4 text-left">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
                    <p className="text-base sm:text-2xl font-display font-semibold mt-1">{s.v}</p>
                    <p className="text-xs text-success mt-1">{s.d}</p>
                  </div>
                ))}
                <div className="col-span-3 h-32 sm:h-44 rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-border/60 relative overflow-hidden">
                  <div className="absolute inset-0 gradient-aurora opacity-60" style={{ background: "var(--gradient-aurora)" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-display font-semibold">Everything you need, <span className="gradient-text">nothing you don't</span></h2>
          <p className="mt-4 text-muted-foreground">A complete operating system for modern commerce teams.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl glass shadow-card p-6 hover:shadow-glow transition-shadow group">
              <div className="size-12 rounded-xl gradient-primary grid place-items-center shadow-glow group-hover:scale-110 transition-transform">
                <f.icon className="size-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="container mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="rounded-3xl glass shadow-card p-8 sm:p-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl sm:text-4xl font-display font-semibold gradient-text">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-display font-semibold">Loved by <span className="gradient-text">teams worldwide</span></h2>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-2xl glass shadow-card p-6">
              <div className="flex gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-current" />)}
              </div>
              <p className="mt-4 text-base">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="size-10 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 sm:p-14 text-center shadow-glow">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-aurora)" }} />
          <div className="relative">
            <h3 className="text-3xl sm:text-4xl font-display font-semibold text-primary-foreground">Stay in the loop</h3>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">Product updates, design notes and stories from the Luxe team.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed"); }}
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input required type="email" placeholder="you@company.com"
                className="h-12 rounded-xl bg-background/90 border-0 text-foreground" />
              <Button className="h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg gradient-primary grid place-items-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Luxe</span>
            <span>· © 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
