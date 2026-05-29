import { useMemo, useState, ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rightActions?: ReactNode;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data, columns, searchKeys = [], rowKey, onRowClick, rightActions, pageSize = 10,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let rows = data;
    if (q && searchKeys.length) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)));
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1; if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [data, q, sortKey, sortDir, searchKeys]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * pageSize, cur * pageSize);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…" className="pl-9 h-9 bg-muted/40" />
        </div>
        <div className="flex items-center gap-2">{rightActions}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 text-muted-foreground">
              {columns.map((c) => (
                <th key={String(c.key)} className={`text-left font-medium px-4 py-3 whitespace-nowrap ${c.className ?? ""}`}>
                  {c.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => {
                        if (sortKey === c.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                        else { setSortKey(String(c.key)); setSortDir("asc"); }
                      }}
                    >
                      {c.header} <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-border transition-colors ${onRowClick ? "cursor-pointer hover:bg-accent/40" : ""}`}
              >
                {columns.map((c) => (
                  <td key={String(c.key)} className={`px-4 py-3 ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {!slice.length && (
              <tr><td className="px-4 py-10 text-center text-muted-foreground" colSpan={columns.length}>No results.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border text-sm">
        <span className="text-muted-foreground">Showing {(cur - 1) * pageSize + 1}–{Math.min(cur * pageSize, total)} of {total}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-accent press disabled:opacity-40" disabled={cur === 1}><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-2 text-muted-foreground">{cur} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-accent press disabled:opacity-40" disabled={cur === pages}><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
