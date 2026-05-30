import { Link } from "@tanstack/react-router";

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">

      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Zenvy</span>

        </span>
      )}
    </Link>
  );
}
