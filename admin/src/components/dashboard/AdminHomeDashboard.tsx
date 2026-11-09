import React from 'react';
import { FolderTree, Package, Plus, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { setActiveTab } from '../../store/uiSlice.ts';

export const AdminHomeDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const categories = useAppSelector((state) => state.categories.items);
  const lowStock = products.filter((product) => product.stock <= product.lowStockThreshold).length;

  const cards = [
    { title: 'Products', value: products.length, detail: `${lowStock} at or below low-stock threshold`, icon: Package, tab: 'products' as const },
    { title: 'Categories', value: categories.length, detail: 'Store catalog collections', icon: FolderTree, tab: 'categories' as const },
  ];

  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Store administration</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Dashboard home</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the product catalog and organize it into categories.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(({ title, value, detail, icon: Icon, tab }) => (
          <button
            key={title}
            onClick={() => dispatch(setActiveTab(tab))}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">{title}</span>
              <Icon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{detail}</div>
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-slate-950 p-6 text-white">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Catalog actions</h2>
            <p className="mt-1 text-sm text-slate-400">Create products and categories stored in the Zenvy backend.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => dispatch(setActiveTab('products'))} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200">
              <Plus className="h-4 w-4" /> Add product
            </button>
            <button onClick={() => dispatch(setActiveTab('categories'))} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Categories <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
