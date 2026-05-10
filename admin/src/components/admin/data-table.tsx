import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  empty?: ReactNode;
}

export function DataTable<T extends { id: string }>({ columns, rows, pageSize = 8, empty }: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize]
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl glass p-12 text-center text-muted-foreground">
        {empty ?? "No results found."}
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass shadow-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn("text-xs uppercase tracking-wider", c.className)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow key={row.id} className="border-border/40 hover:bg-accent/30 transition-colors">
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>{c.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border/60 text-sm text-muted-foreground">
        <span>Page {page} of {totalPages} · {rows.length} total</span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
