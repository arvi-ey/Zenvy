import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { upsertCategory, deleteCategory } from '../../store/categoriesAndCouponsSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { Category } from '../../types/index.ts';
import { Plus, FolderTree, Trash2, X, Check, Package } from 'lucide-react';
import { ASSET_WATCH } from '../../store/mockData.ts';
import { categoryService } from '../../api/services/otherServices.ts';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const products = useAppSelector((state) => state.products.items);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const category = await categoryService.createCategory({
        name: data.name,
        image: new URL(ASSET_WATCH, window.location.origin).toString(),
      });
      dispatch(upsertCategory(category));
      dispatch(addToast({
        type: 'success',
        title: 'Category Added',
        message: `Category "${data.name}" was saved to the catalog.`,
      }));
      reset();
      setIsAddModalOpen(false);
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Category could not be saved.';
      dispatch(addToast({ type: 'error', title: 'Save Failed', message }));
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await categoryService.deleteCategory(cat.id);
      dispatch(deleteCategory(cat.id));
      dispatch(addToast({
        type: 'info',
        title: 'Category Removed',
        message: `Category "${cat.name}" was removed from the catalog.`,
      }));
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Category could not be deleted.';
      dispatch(addToast({ type: 'error', title: 'Delete Failed', message }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Store Taxonomy & Collections
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize products into curated luxury collections and navigational departments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const actualProductCount = products.filter((p) => p.category === cat.name).length;
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col"
            >
              <div className="h-32 relative bg-slate-100 dark:bg-slate-800">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleDelete(cat)}
                    aria-label={`Delete category ${cat.name}`}
                    className="p-1.5 bg-black/50 hover:bg-rose-600 text-white rounded-md backdrop-blur-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-400">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || 'Products in this collection.'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>{actualProductCount} live products</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded">
                    {cat.status === 'active' ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Add New Category
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={41}
                    {...register('name')}
                    placeholder="e.g. Minimalist Lighting"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Create Category</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
