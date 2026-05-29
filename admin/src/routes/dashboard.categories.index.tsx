import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addCategory, Category, deleteCategory, updateCategory } from "@/redux/slices/categoriesSlice";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/categories/")({
  head: () => ({ meta: [{ title: "Categories — Northstar" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const list = useAppSelector((s) => s.categories.list);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const blank = { name: "", description: "", itemCount: 0 };
  const [form, setForm] = useState(blank);

  function save() {
    if (!form.name) return toast.error("Name required.");
    if (editing) { dispatch(updateCategory({ ...editing, ...form })); toast.success("Category updated"); }
    else { dispatch(addCategory(form)); toast.success("Category created"); }
    setOpen(false); setEditing(null); setForm(blank);
  }

  const columns: Column<Category>[] = [
    { key: "name", header: "Name", sortable: true, render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "description", header: "Description", render: (c) => <span className="text-muted-foreground">{c.description}</span> },
    { key: "itemCount", header: "Items", sortable: true, render: (c) => <span className="tabular-nums">{c.itemCount}</span> },
    { key: "actions", header: "", render: (c) => (
      <div className="flex gap-1">
        <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description, itemCount: c.itemCount }); setOpen(true); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent press"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => { dispatch(deleteCategory(c.id)); toast.success("Deleted"); }} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive press"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Item Categories"
        description="Organize your catalog with curated categories."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(blank); } }}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow"><Plus className="h-4 w-4" /> Add category</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md border border-border text-sm">Cancel</button>
                <button onClick={save} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold">{editing ? "Save" : "Create"}</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable data={list} columns={columns} searchKeys={["name", "description"]} rowKey={(c) => c.id} />
    </div>
  );
}
