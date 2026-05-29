import { Link } from "@tanstack/react-router";

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow press">
        <span className="absolute inset-0 rounded-lg opacity-40 blur-md bg-gradient-primary anim-pulse-glow" aria-hidden />
        <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 2l3.5 6.5L22 10l-5 4.5L18.5 22 12 18.5 5.5 22 7 14.5 2 10l6.5-1.5L12 2z" />
        </svg>
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Zenvy</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">T-Shirt Co. Admin</span>
        </span>
      )}
    </Link>
  );
}
