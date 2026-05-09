import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">

      {/* ── Ambient glow orbs ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
          style={{ background: "radial-gradient(circle, oklch(0.75 0.15 85) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -left-20 h-[500px] w-[500px] rounded-full opacity-[0.05] dark:opacity-[0.10]"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.15 220) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Fine grid ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(var(--foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Grain ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* ── Diagonal split — desktop ── */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[52%] bg-foreground md:block"
        style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />
      {/* ── Diagonal split — mobile ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[48%] w-full bg-foreground md:hidden"
        style={{ clipPath: "polygon(0 18%, 100% 0, 100% 100%, 0 100%)" }}
      />

      {/* ══════════════════════════════
          MAIN GRID
      ══════════════════════════════ */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 items-center px-6 pb-20 pt-28 md:grid-cols-2 md:px-14 md:pb-16 md:pt-0 lg:px-24">

        {/* ── LEFT: Copy ── */}
        <div className="flex flex-col gap-7">

          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
            <span className="block h-px w-8 bg-foreground/30" />
            <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              SS25 · New Collection
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-0 leading-none">
            <h1 className="logo-txt text-[clamp(3.5rem,9vw,8rem)] leading-[0.88] tracking-[-0.02em] text-foreground">
              WEAR
            </h1>
            <h1
              className="logo-txt text-[clamp(3.5rem,9vw,8rem)] leading-[0.88] tracking-[-0.02em]"
              style={{
                WebkitTextStroke: "1.5px var(--foreground)",
                color: "transparent",
              }}
            >
              YOUR
            </h1>
            <h1 className="logo-txt text-[clamp(3.5rem,9vw,8rem)] leading-[0.88] tracking-[-0.02em] text-foreground">
              STORY
            </h1>
          </div>

          {/* Sub-copy — uses text-foreground/60 so it works light & dark */}
          <p className="max-w-[360px] text-base font-light leading-[1.75] tracking-wide text-foreground/60 md:text-[1.05rem]">
            Premium tees for those who live boldly. Every thread carries
            intent — wear yours like a statement.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5">
            <button className="group relative flex items-center gap-3 overflow-hidden border border-foreground bg-foreground px-7 py-3.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-background transition-all duration-500">
              <span
                className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">Shop the Drop</span>
              <svg
                className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 14 14" fill="none"
              >
                <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button className="group flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-foreground/60 transition-all duration-300 hover:text-foreground">
              <span>Lookbook</span>
              <span className="block h-px w-6 bg-current transition-all duration-300 group-hover:w-10" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-0 border-t border-border pt-7">
            {[
              { value: "200+", label: "Designs" },
              { value: "50K+", label: "Customers" },
              { value: "4.9", label: "Rating", star: true },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-1 flex-col gap-1 ${i !== 0 ? "border-l border-border pl-5" : "pr-5"}`}
              >
                <span className="logo-txt text-[1.85rem] font-black leading-none text-foreground md:text-4xl">
                  {stat.value}
                  {stat.star && <span className="ml-0.5 text-base text-yellow-500">★</span>}
                </span>
                <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Visual ── */}
        <div className="relative flex items-center justify-center py-10 md:py-0 md:pl-16 lg:pl-20">

          {/* Corner brackets */}
          <div className="pointer-events-none absolute inset-0 z-20">
            <span className="absolute left-4 top-4 block h-8 w-8 border-l-2 border-t-2 border-primary-foreground/20 md:left-12 md:top-6" />
            <span className="absolute right-4 top-4 block h-8 w-8 border-r-2 border-t-2 border-primary-foreground/20 md:right-0 md:top-6" />
            <span className="absolute bottom-24 left-4 block h-8 w-8 border-b-2 border-l-2 border-primary-foreground/20 md:bottom-16 md:left-12" />
            <span className="absolute bottom-24 right-4 block h-8 w-8 border-b-2 border-r-2 border-primary-foreground/20 md:bottom-16 md:right-0" />
          </div>

          <div className="relative flex items-center justify-center">

            {/* Slow-spinning ring */}
            <div
              className="absolute h-[300px] w-[300px] rounded-full border border-primary-foreground/10 md:h-[460px] md:w-[460px]"
              style={{ animation: "spin 28s linear infinite" }}
            />

            {/* Dashed static ring */}
            <div className="absolute h-[280px] w-[280px] rounded-full border border-dashed border-primary-foreground/8 md:h-[430px] md:w-[430px]" />

            {/* Product card */}
            <div
              className="relative h-[270px] w-[205px] overflow-hidden md:h-[420px] md:w-[315px] lg:h-[490px] lg:w-[365px]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 94%, 93% 100%, 0 100%)",
                boxShadow: "0 40px 80px -20px rgba(0,0,0,0.55)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.82_0.01_60)] via-[oklch(0.76_0.01_60)] to-[oklch(0.62_0.01_60)]" />

              {/* Scanlines */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg,#000 0px,#000 1px,transparent 1px,transparent 4px)",
                }}
              />

              {/* Shirt */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 230"
                  className="h-[80%] w-[80%]"
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M62 12 L8 52 L34 68 L34 215 L166 215 L166 68 L192 52 L138 12 Q120 34 100 34 Q80 34 62 12Z"
                    fill="oklch(0.11 0 0)"
                  />
                  <path d="M62 12 L8 52 L20 58 L60 22Z" fill="oklch(0.18 0 0)" opacity="0.6" />
                  <path d="M138 12 L192 52 L180 58 L140 22Z" fill="oklch(0.18 0 0)" opacity="0.6" />
                  <path d="M78 14 Q100 42 122 14" fill="oklch(0.15 0 0)" stroke="oklch(0.35 0 0)" strokeWidth="1" />
                  <line x1="100" y1="50" x2="100" y2="215" stroke="oklch(0.22 0 0)" strokeWidth="0.8" opacity="0.5" />
                  <rect x="72" y="88" width="56" height="42" rx="2" fill="none" stroke="oklch(0.96 0 0)" strokeWidth="0.6" opacity="0.25" />
                  <circle cx="100" cy="109" r="10" fill="none" stroke="oklch(0.96 0 0)" strokeWidth="0.8" opacity="0.5" />
                  <text x="96" y="113" fontSize="7" fontFamily="monospace" fill="oklch(0.96 0 0)" opacity="0.7" letterSpacing="1">ST</text>
                  <line x1="50" y1="210" x2="150" y2="210" stroke="oklch(0.25 0 0)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                </svg>
              </div>

              {/* Season tag */}
              <div className="absolute right-0 top-0 bg-foreground px-3 py-1.5">
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-background">SS/25</span>
              </div>
            </div>

            {/* Floating badge — NEW DROP */}
            {/* Uses bg-background so it's correct in both themes */}
            <div
              className="absolute -left-5 top-10 flex flex-col items-center gap-0.5 border border-primary-foreground/15 bg-background px-4 py-3 shadow-2xl md:-left-14 md:top-14"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 88% 100%, 0 100%)" }}
            >
              <span className="logo-txt text-xl font-black leading-none text-foreground md:text-2xl">NEW</span>
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">Drop</span>
            </div>

            {/* Floating badge — Free Shipping */}
            <div className="absolute -right-3 bottom-12 flex items-center gap-2 bg-background px-4 py-2.5 shadow-2xl md:-right-10 md:bottom-18">
              <span className="block h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-[11px] font-semibold tracking-wider text-foreground">Free Shipping</span>
              <span className="font-mono text-[10px] text-muted-foreground">₹999+</span>
            </div>

            {/* Data readout — desktop only, on the dark side so text is primary-foreground */}
            <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
              {["100%", "CTN", "ECO"].map((v) => (
                <div key={v} className="flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[8px] font-bold tracking-wider text-primary-foreground/50">{v}</span>
                  <span className="block h-px w-4 bg-primary-foreground/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="absolute bottom-0 left-0 z-20 w-full overflow-hidden border-t border-foreground/10 bg-foreground py-3">
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{ animation: "ticker 22s linear infinite" }}
        >
          {Array.from({ length: 4 }).flatMap((_, i) =>
            ["PREMIUM QUALITY", "◆", "100% COTTON", "◆", "LIMITED DROPS", "◆", "FREE RETURNS", "◆", "ETHICALLY MADE", "◆"].map(
              (item, j) => (
                <span
                  key={`${i}-${j}`}
                  className={`font-mono text-[10px] tracking-[0.28em] uppercase ${item === "◆" ? "text-background/20" : "text-background/70"
                    }`}
                >
                  {item}
                </span>
              )
            )
          )}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
