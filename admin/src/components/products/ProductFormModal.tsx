import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Check } from 'lucide-react';
import { Product, ProductStatus } from '../../types/index.ts';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { upsertProduct } from '../../store/productsSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { ProductImageUploader } from './ProductImageUploader.tsx';
import { ASSET_WATCH } from '../../store/mockData.ts';
import { productService } from '../../api/services/productService.ts';

const productSchema = z.object({
  title: z.string().min(3, 'Product title must be at least 3 characters long'),
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'SKU may only contain letters, numbers, and hyphens'),
  category: z.string().min(1, 'Please select a product category'),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().optional().nullable(),
  costPrice: z.number().optional().nullable(),
  lowStockThreshold: z.number().int().nonnegative('Threshold must be 0 or more'),
  status: z.enum(['published', 'draft', 'archived'] as const),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  tagsInput: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);

  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [inventoryError, setInventoryError] = useState<string>('');
  const [inventoryVariants, setInventoryVariants] = useState<Array<{
    size: string;
    totalStock: number;
    reservedStock: number;
  }>>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      sku: '',
      category: '',
      price: 0,
      compareAtPrice: null,
      costPrice: null,
      lowStockThreshold: 5,
      status: 'published',
      description: '',
      tagsInput: '',
    },
  });

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      reset({
        title: productToEdit.title,
        sku: productToEdit.sku,
        category: productToEdit.category,
        price: productToEdit.price,
        compareAtPrice: productToEdit.compareAtPrice ?? null,
        costPrice: productToEdit.costPrice ?? null,
        lowStockThreshold: productToEdit.lowStockThreshold,
        status: productToEdit.status,
        description: productToEdit.description,
        tagsInput: productToEdit.tags?.join(', ') || '',
      });
      setImages(productToEdit.images || [productToEdit.thumbnail]);
      setThumbnail(productToEdit.thumbnail);
      setInventoryVariants(productToEdit.variants?.length
        ? productToEdit.variants.map((variant) => ({
            size: variant.size,
            totalStock: variant.totalStock,
            reservedStock: variant.reservedStock,
          }))
        : [{ size: 'FREE', totalStock: productToEdit.stock, reservedStock: 0 }]);
    } else {
      reset({
        title: '',
        sku: `ZNV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        category: categories[0]?.name || 'Watches & Timepieces',
        price: 99.0,
        compareAtPrice: null,
        costPrice: null,
        lowStockThreshold: 5,
        status: 'published',
        description: '',
        tagsInput: 'luxury, timeless',
      });
      setImages([ASSET_WATCH]);
      setThumbnail(ASSET_WATCH);
      setInventoryVariants([{ size: 'M', totalStock: 20, reservedStock: 0 }]);
    }
    setImageError('');
    setInventoryError('');
  }, [productToEdit, reset, categories]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      setImageError('Please add at least one product photo or sample asset.');
      return;
    }
    if (images.some((image) => image.startsWith('blob:'))) {
      setImageError('Local image previews cannot be saved yet. Add a hosted image URL or use a sample image.');
      return;
    }

    const category = categories.find((item) => item.name === data.category);
    if (!category || !Number.isInteger(Number(category.id))) {
      setImageError('Select a category from the connected catalog before saving.');
      return;
    }
    if (
      inventoryVariants.length === 0 ||
      new Set(inventoryVariants.map((variant) => variant.size)).size !== inventoryVariants.length ||
      inventoryVariants.some((variant) => variant.totalStock < variant.reservedStock)
    ) {
      setInventoryError('Add unique sizes and ensure total stock is not below reserved stock.');
      return;
    }

    const tags = data.tagsInput
      ? data.tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const finalThumbnail = thumbnail || images[0];
    const orderedImages = [finalThumbnail, ...images.filter((image) => image !== finalThumbnail)];
    try {
      const input = {
        title: data.title,
        description: data.description,
        categoryId: Number(category.id),
        categoryName: category.name,
        sku: data.sku.toUpperCase(),
        stock: inventoryVariants.reduce(
          (sum, variant) => sum + variant.totalStock - variant.reservedStock,
          0
        ),
        variants: inventoryVariants.map((variant) => ({
          size: variant.size,
          total_stock: variant.totalStock,
        })),
        price: Number(data.price),
        compareAtPrice: Number.isFinite(data.compareAtPrice) ? Number(data.compareAtPrice) : null,
        costPrice: Number.isFinite(data.costPrice) ? Number(data.costPrice) : null,
        lowStockThreshold: Number(data.lowStockThreshold),
        tags,
        status: data.status,
        images: orderedImages.map((image) => new URL(image, window.location.origin).toString()),
      };
      const savedProduct = productToEdit
        ? await productService.updateProduct(productToEdit.id, input)
        : await productService.createProduct(input);
      dispatch(upsertProduct(savedProduct));
      dispatch(
        addToast({
          type: 'success',
          title: productToEdit ? 'Product Updated' : 'Product Created',
          message: `"${data.title}" was saved to the catalog.`,
        })
      );
      onClose();
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Product could not be saved.';
      dispatch(addToast({ type: 'error', title: 'Save Failed', message }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {productToEdit ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Catalog changes are saved to the backend and available after signing in again.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Title & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. Titanium Chronograph Automatic"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                />
                {errors.title && <p className="text-[11px] text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  SKU <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('sku')}
                  placeholder="ZNV-WTC-01"
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                    errors.sku ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                />
                {errors.sku && <p className="text-[11px] text-rose-500">{errors.sku.message}</p>}
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-[11px] text-rose-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catalog Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  <option value="published">Published (Visible in store)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Price, Compare At, and Cost */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Price ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                    errors.price ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
                />
                {errors.price && <p className="text-[11px] text-rose-500">{errors.price.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Compare At ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('compareAtPrice', { valueAsNumber: true })}
                  placeholder="e.g. 550"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Unit Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('costPrice', { valueAsNumber: true })}
                  placeholder="e.g. 180"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            {/* Inventory per product size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Variant Inventory
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const nextSize = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE']
                      .find((size) => !inventoryVariants.some((variant) => variant.size === size));
                    if (nextSize) setInventoryVariants((current) => [
                      ...current,
                      { size: nextSize, totalStock: 0, reservedStock: 0 },
                    ]);
                  }}
                  className="text-[11px] font-medium text-slate-700 hover:underline dark:text-slate-300"
                >
                  Add size
                </button>
              </div>
              {inventoryVariants.map((variant, index) => (
                <div key={`${variant.size}-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                  <select
                    value={variant.size}
                    onChange={(event) => {
                      const size = event.target.value;
                      setInventoryVariants((current) => current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, size } : item
                      ));
                      setInventoryError('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    aria-label={`Size for inventory row ${index + 1}`}
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={variant.reservedStock}
                    value={variant.totalStock}
                    onChange={(event) => {
                      const totalStock = Number(event.target.value);
                      setInventoryVariants((current) => current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, totalStock } : item
                      ));
                      setInventoryError('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
                    aria-label={`Total stock for size ${variant.size}`}
                  />
                  <button
                    type="button"
                    onClick={() => setInventoryVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    disabled={inventoryVariants.length === 1}
                    className="px-2 text-xs text-rose-600 disabled:opacity-40"
                    aria-label={`Remove size ${variant.size}`}
                  >
                    Remove
                  </button>
                  <p className="col-span-3 -mt-1 text-[10px] text-slate-500">
                    Total {variant.totalStock} · Reserved {variant.reservedStock} · Available {Math.max(0, variant.totalStock - variant.reservedStock)}
                  </p>
                </div>
              ))}
              {inventoryError && <p className="text-[11px] text-rose-500">{inventoryError}</p>}
            </div>

            {/* Low Stock Threshold */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Low Stock Warning Threshold
                </label>
                <input
                  type="number"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
              <div className="flex items-end text-[11px] text-slate-500">
                Product available stock: {inventoryVariants.reduce(
                  (sum, variant) => sum + Math.max(0, variant.totalStock - variant.reservedStock),
                  0
                )}
              </div>
            </div>

            {/* Image Uploader with local browser preview */}
            <ProductImageUploader
              images={images}
              thumbnail={thumbnail}
              onChange={(newImages, newThumb) => {
                setImages(newImages);
                setThumbnail(newThumb);
                if (newImages.length > 0) setImageError('');
              }}
              error={imageError}
            />

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Detailed craft specifications, materials, dimensions, and warranty..."
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.description ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white`}
              />
              {errors.description && <p className="text-[11px] text-rose-500">{errors.description.message}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                {...register('tagsInput')}
                placeholder="luxury, waterproof, titanium, minimalist"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{productToEdit ? 'Save Changes' : 'Publish Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
