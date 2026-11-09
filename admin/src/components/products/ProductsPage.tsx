import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  setSearchQuery,
  setCategoryFilter,
  setStatusFilter,
  setStockFilter,
  setSorting,
  setCurrentPage,
  resetFilters,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateStatus,
  upsertProduct,
  toggleSelectId,
  toggleSelectAll,
  clearSelection,
} from '../../store/productsSlice.ts';
import { addToast } from '../../store/uiSlice.ts';
import { Product } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import {
  filterProducts,
  sortProducts,
  paginateItems,
  calculateInventoryMetrics,
} from '../../utils/analyticsCalculations.ts';
import { StatusBadge } from '../common/Badge.tsx';
import { ProductFormModal } from './ProductFormModal.tsx';
import { ProductDeleteModal } from './ProductDeleteModal.tsx';
import { productService } from '../../api/services/productService.ts';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
  Package,
  Layers,
  CheckCircle2,
  Archive,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: allProducts,
    searchQuery,
    categoryFilter,
    statusFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    selectedIds,
  } = useAppSelector((state) => state.products);

  const categories = useAppSelector((state) => state.categories.items);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Compute inventory health metrics
  const metrics = calculateInventoryMetrics(allProducts);

  // Filter & sort
  const filtered = filterProducts(allProducts, searchQuery, categoryFilter, statusFilter, stockFilter);
  const sorted = sortProducts(filtered, sortBy, sortOrder);
  const { items: paginatedProducts, totalPages, totalCount } = paginateItems(sorted, currentPage, pageSize);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (p: Product) => {
    setProductToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await productService.deleteProduct(productToDelete.id);
        dispatch(deleteProduct(productToDelete.id));
        dispatch(addToast({
          type: 'success',
          title: 'Product Deleted',
          message: `Product "${productToDelete.title}" removed.`,
        }));
      } catch (error) {
        const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'Product could not be deleted.';
        dispatch(addToast({ type: 'error', title: 'Delete Failed', message }));
      }
    }
  };

  const handleDuplicate = async (p: Product) => {
    const category = categories.find((item) => item.name === p.category);
    if (!category || !Number.isInteger(Number(category.id))) {
      dispatch(addToast({ type: 'error', title: 'Duplicate Failed', message: 'The product category is unavailable.' }));
      return;
    }
    try {
      const copy = await productService.createProduct({
        title: `${p.title} (Copy)`,
        description: p.description,
        categoryId: Number(category.id),
        categoryName: category.name,
        sku: `ZNV-${p.id}-CP-${Date.now().toString(36)}`,
        stock: p.stock,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        costPrice: p.costPrice ?? null,
        lowStockThreshold: p.lowStockThreshold,
        tags: p.tags,
        status: 'draft',
        images: p.images.map((image) => new URL(image, window.location.origin).toString()),
      });
      dispatch(upsertProduct(copy));
      dispatch(addToast({ type: 'success', title: 'Product Duplicated', message: `Draft created for "${p.title}".` }));
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Product could not be duplicated.';
      dispatch(addToast({ type: 'error', title: 'Duplicate Failed', message }));
    }
  };

  const handleBulkStatus = async (status: 'published' | 'archived') => {
    try {
      await productService.bulkUpdateStatus(selectedIds, status);
      dispatch(bulkUpdateStatus({ ids: selectedIds, status }));
      dispatch(addToast({
        type: status === 'published' ? 'success' : 'info',
        title: status === 'published' ? 'Bulk Updated' : 'Bulk Archived',
        message: `${status === 'published' ? 'Published' : 'Archived'} ${selectedIds.length} products.`,
      }));
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Products could not be updated.';
      dispatch(addToast({ type: 'error', title: 'Update Failed', message }));
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    try {
      await productService.bulkDelete(selectedIds);
      dispatch(bulkDeleteProducts(selectedIds));
      dispatch(addToast({ type: 'success', title: 'Bulk Deleted', message: `Deleted ${count} products.` }));
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Selected products could not be deleted.';
      dispatch(addToast({ type: 'error', title: 'Delete Failed', message }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Inventory Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Products</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {metrics.totalProducts}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Total Valuation: <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{formatCurrency(metrics.totalInventoryValue)}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            In Stock
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {metrics.inStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Available for dispatch</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Low Stock Alerts
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-1">
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">At or below threshold</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Out of Stock
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-700 dark:text-rose-400 mt-1">
            {metrics.outOfStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Immediate restock needed</div>
        </div>
      </div>

      {/* Action / Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search products by title, SKU, or tag..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 px-2 font-medium">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={() => void handleBulkStatus('published')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  Publish
                </button>
                <button
                  onClick={() => void handleBulkStatus('archived')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  Archive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            )}

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Stock:</span>
            <select
              value={stockFilter}
              onChange={(e) => dispatch(setStockFilter(e.target.value))}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤ threshold)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500">Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as ['title' | 'price' | 'stock' | 'createdAt', 'asc' | 'desc'];
                dispatch(setSorting({ sortBy: sb, sortOrder: so }));
              }}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>

            {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all') && (
              <button
                onClick={() => dispatch(resetFilters())}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline text-xs ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Catalog Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {paginatedProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No products match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, changing category filters, or add a new product to your inventory.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => dispatch(resetFilters())}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear Filters
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800"
              >
                Create Product
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={() =>
                        dispatch(toggleSelectAll(paginatedProducts.map((p) => p.id)))
                      }
                      aria-label="Select all products on page"
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:focus:ring-white"
                    />
                  </th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-center">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-slate-100 dark:bg-slate-800/80' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => dispatch(toggleSelectId(p.id))}
                          aria-label={`Select ${p.title}`}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      </td>

                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.images[0]}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                              {p.title}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-mono">{p.sku}</span>
                              {p.tags.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate max-w-32">{p.tags.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {p.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(p.price)}
                        </div>
                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(p.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertCircle className="w-3 h-3" />
                            0 units
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            {p.stock} left
                          </span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{p.stock}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={p.status} type="product" />
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            title="Duplicate Product"
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(p)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              Showing <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> items
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                aria-label="Previous page"
                className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                aria-label="Next page"
                className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
      />

      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};
