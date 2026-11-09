import { apiClient } from '../axiosClient.ts';
import { Product } from '../../types/index.ts';

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  sku: string | null;
  category_id: number;
  category_name: string;
  stock: number | string;
  price: number | string;
  compare_at_price: number | string | null;
  cost_price: number | string | null;
  low_stock_threshold: number;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  images: Array<{ url: string; is_main: boolean }>;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  sku: string;
  stock: number;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  lowStockThreshold: number;
  tags: string[];
  status: Product['status'];
  images: string[];
}

function toProduct(product: ApiProduct): Product {
  const images = (product.images ?? []).map((image) => image.url);
  const cover = product.images?.find((image) => image.is_main)?.url ?? images[0] ?? '';
  return {
    id: String(product.id),
    title: product.name,
    sku: product.sku ?? `ZNV-${product.id}`,
    category: product.category_name,
    price: Number(product.price),
    compareAtPrice: product.compare_at_price === null ? undefined : Number(product.compare_at_price),
    costPrice: product.cost_price === null ? undefined : Number(product.cost_price),
    stock: Number(product.stock),
    lowStockThreshold: product.low_stock_threshold,
    status: product.status === 'active' ? 'published' : product.status === 'inactive' ? 'archived' : 'draft',
    images,
    thumbnail: cover,
    description: product.description,
    tags: product.tags ?? [],
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

function toApiProduct(product: ProductInput) {
  return {
    name: product.title,
    description: product.description,
    sku: product.sku,
    category_id: product.categoryId,
    stock: product.stock,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    cost_price: product.costPrice ?? null,
    low_stock_threshold: product.lowStockThreshold,
    tags: product.tags,
    status: product.status === 'published' ? 'active' : product.status === 'archived' ? 'inactive' : 'draft',
    images: product.images,
  };
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const products = await apiClient.get<ApiProduct[]>('/product/admin-list');
    return products.map(toProduct);
  },

  async createProduct(product: ProductInput): Promise<Product> {
    const created = await apiClient.post<ApiProduct>('/product/add-product', toApiProduct(product));
    const images = product.images.map((url, index) => ({ url, is_main: index === 0 }));
    return toProduct({ ...created, category_name: product.categoryName, images });
  },

  async updateProduct(id: string, product: ProductInput): Promise<Product> {
    const updated = await apiClient.put<ApiProduct>(`/product/${id}`, toApiProduct(product));
    const images = product.images.map((url, index) => ({ url, is_main: index === 0 }));
    return toProduct({ ...updated, category_name: product.categoryName, images });
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/product/${id}`);
  },

  async bulkUpdateStatus(ids: string[], status: Product['status']): Promise<{ count: number }> {
    const apiStatus = status === 'published' ? 'active' : status === 'archived' ? 'inactive' : 'draft';
    return apiClient.post('/product/bulk-status', {
      ids: ids.map(Number),
      status: apiStatus,
    });
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    return apiClient.post('/product/bulk-delete', { ids: ids.map(Number) });
  },
};
