import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addItem, deleteItem, Item, updateItem } from "@/redux/slices/itemsSlice";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem as SItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/items/")({
  head: () => ({ meta: [{ title: "Tees — Zenvy" }] }),
  component: ItemsPage,
});

const MAX_IMAGES = 3;

function ItemsPage() {
  const items = useAppSelector((s) => s.items.list);
  const categories = useAppSelector((s) => s.categories.list);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<Item | null>(null);
  const [viewing, setViewing] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blank = {
    name: "", sku: "", category: categories[0]?.name ?? "Classics",
    price: 0, stock: 0, status: "active" as Item["status"],
    description: "", images: [] as string[],
  };
  const [form, setForm] = useState(blank);

  function onPickFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) { toast.error(`Max ${MAX_IMAGES} images`); return; }
    const picked = Array.from(files).slice(0, remaining);
    Promise.all(picked.map((f) => new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    }))).then((urls) => setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, MAX_IMAGES) })));
  }
  function removeImage(i: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  }

  function save() {
    if (!form.name || !form.sku) return toast.error("Name and SKU required.");
    if (editing) { dispatch(updateItem({ ...editing, ...form })); toast.success("Tee updated"); }
    else { dispatch(addItem(form)); toast.success("Tee added"); }
    setOpen(false); setEditing(null); setForm(blank);
  }

  const columns: Column<Item>[] = [
    { key: "name", header: "Tee", sortable: true, render: (i) => (
      <div className="flex items-center gap-3">
        {i.images?.[0] ? (
          <img src={i.images[0]} alt="" className="h-10 w-10 rounded-md object-cover border border-border" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted border border-border" />
        )}
        <div><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground font-mono">{i.sku}</p></div>
      </div>
    ) },
    { key: "category", header: "Category", sortable: true, render: (i) => <span className="text-xs px-2 py-0.5 rounded-md bg-muted">{i.category}</span> },
    { key: "price", header: "Price", sortable: true, render: (i) => <span className="tabular-nums font-medium">${i.price.toLocaleString()}</span> },
    { key: "stock", header: "Stock", sortable: true, render: (i) => <span className={`tabular-nums ${i.stock < 30 ? "text-warning font-semibold" : ""}`}>{i.stock}</span> },
    { key: "status", header: "Status", render: (i) => <StatusPill status={i.status} /> },
    { key: "actions", header: "", render: (i) => (
      <div className="flex gap-1">
        <button onClick={() => setViewing(i)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent press"><Eye className="h-4 w-4" /></button>
        <button onClick={() => { setEditing(i); setForm({ name: i.name, sku: i.sku, category: i.category, price: i.price, stock: i.stock, status: i.status, description: i.description ?? "", images: i.images ?? [] }); setOpen(true); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent press"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => { dispatch(deleteItem(i.id)); toast.success("Tee deleted"); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive press"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Tees"
        description="Your full catalog of Zenvy t-shirts, drops and SKUs."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(blank); } }}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow"><Plus className="h-4 w-4" /> Add tee</button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? "Edit tee" : "Add tee"}</DialogTitle></DialogHeader>

              {/* Images */}
              <div className="space-y-2">
                <Label>Product images <span className="text-muted-foreground font-normal">(up to {MAX_IMAGES})</span></Label>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                    const url = form.images[i];
                    return (
                      <div key={i} className="relative aspect-square rounded-lg border border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center">
                        {url ? (
                          <>
                            <img src={url} alt={`tee ${i + 1}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 border border-border inline-flex items-center justify-center hover:bg-destructive/10 text-destructive press">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground press">
                            <ImagePlus className="h-5 w-5" /> Upload
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onPickFiles(e.target.files); e.target.value = ""; }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Zenvy Classic Crewneck Tee" /></div>
                <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="ZNV-60000" /></div>
                <div className="space-y-1.5"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SItem key={c.id} value={c.name}>{c.name}</SItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Price ($)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div className="col-span-2 space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Item["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["active", "draft", "archived"].map((s) => <SItem key={s} value={s}>{s}</SItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Soft 100% combed cotton, midweight 200gsm, ribbed crew collar…" rows={4} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md border border-border text-sm">Cancel</button>
                <button onClick={save} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold">{editing ? "Save" : "Create"}</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable data={items} columns={columns} searchKeys={["name", "sku", "category"]} rowKey={(i) => i.id} />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              {!!viewing.images?.length && (
                <div className="grid grid-cols-3 gap-2">
                  {viewing.images.map((u, i) => (
                    <img key={i} src={u} alt="" className="aspect-square w-full object-cover rounded-md border border-border" />
                  ))}
                </div>
              )}
              <p><span className="text-muted-foreground">SKU:</span> <span className="font-mono">{viewing.sku}</span></p>
              <p><span className="text-muted-foreground">Category:</span> {viewing.category}</p>
              <p><span className="text-muted-foreground">Price:</span> ${viewing.price}</p>
              <p><span className="text-muted-foreground">Stock:</span> {viewing.stock}</p>
              <p><span className="text-muted-foreground">Status:</span> <StatusPill status={viewing.status} /></p>
              {viewing.description && (
                <p className="text-muted-foreground leading-relaxed">{viewing.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
