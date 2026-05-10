import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { products } from "@/lib/mock-data";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Products — Luxe Admin" }] }),
});

function ProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(
    () => products.filter((p) =>
      (cat === "all" || p.category === cat) &&
      p.name.toLowerCase().includes(q.toLowerCase())
    ),
    [q, cat]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 shadow-glow rounded-xl">
              <Plus className="size-4 mr-1.5" /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>New product</DialogTitle>
              <DialogDescription>Create a new product in your catalog.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-1.5"><Label>Name</Label><Input placeholder="Aurora Linen Shirt" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Price</Label><Input type="number" placeholder="0.00" /></div>
                <div className="grid gap-1.5"><Label>Stock</Label><Input type="number" placeholder="0" /></div>
              </div>
              <div className="grid gap-1.5">
                <Label>Image</Label>
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Drop image or click to upload
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast.success("Product created")} className="gradient-primary text-primary-foreground border-0">
                Create product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-9 rounded-xl" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Apparel">Apparel</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Beauty">Beauty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        rows={filtered}
        columns={[
          { key: "name", header: "Product", cell: (p) => (
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl gradient-accent" />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.id}</p>
                </div>
              </div>
            ) },
          { key: "category", header: "Category", cell: (p) => <span className="text-muted-foreground">{p.category}</span> },
          { key: "price", header: "Price", cell: (p) => <span className="font-medium">${p.price}</span> },
          { key: "stock", header: "Stock", cell: (p) => p.stock },
          { key: "sold", header: "Sold", cell: (p) => p.sold },
          { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
        ]}
      />
    </div>
  );
}
