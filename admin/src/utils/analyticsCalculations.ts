import { Order, Product } from '../types/index.ts';

/**
 * Pure calculation functions for metrics, filtering, and inventory health.
 * Fully tested with node:test.
 */

export function calculateTotalRevenue(orders: Order[]): number {
  return orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);
}

export function calculateAverageOrderValue(orders: Order[]): number {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  if (paidOrders.length === 0) return 0;
  const total = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  return Number((total / paidOrders.length).toFixed(2));
}

export function calculateOrdersByStatus(orders: Order[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: orders.length,
    unfulfilled: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    if (counts[order.fulfillmentStatus] !== undefined) {
      counts[order.fulfillmentStatus]++;
    }
  }

  return counts;
}

export function calculateInventoryMetrics(products: Product[]) {
  let totalProducts = products.length;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryValue = 0;

  for (const p of products) {
    totalInventoryValue += p.price * p.stock;
    if (p.stock <= 0) {
      outOfStockCount++;
    } else if (p.stock <= p.lowStockThreshold) {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  }

  return {
    totalProducts,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
  };
}

export function filterProducts(
  products: Product[],
  query: string,
  category: string,
  status: string,
  stockFilter: string
): Product[] {
  const q = query.trim().toLowerCase();

  return products.filter((p) => {
    // Search query
    if (q) {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      if (!matchTitle && !matchSku && !matchCategory) return false;
    }

    // Category filter
    if (category && category !== 'all' && p.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // Status filter
    if (status && status !== 'all' && p.status !== status) {
      return false;
    }

    // Stock status filter
    if (stockFilter && stockFilter !== 'all') {
      if (stockFilter === 'in_stock' && p.stock <= p.lowStockThreshold) return false;
      if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock > p.lowStockThreshold)) return false;
      if (stockFilter === 'out_of_stock' && p.stock > 0) return false;
    }

    return true;
  });
}

export function sortProducts(
  products: Product[],
  sortBy: 'title' | 'price' | 'stock' | 'createdAt',
  order: 'asc' | 'desc'
): Product[] {
  return [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'stock') {
      comparison = a.stock - b.stock;
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return order === 'desc' ? -comparison : comparison;
  });
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; totalCount: number; currentPage: number } {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    totalPages,
    totalCount,
    currentPage: safePage,
  };
}
