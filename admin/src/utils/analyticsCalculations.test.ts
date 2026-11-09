import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalRevenue,
  calculateAverageOrderValue,
  calculateOrdersByStatus,
  calculateInventoryMetrics,
  filterProducts,
  sortProducts,
  paginateItems,
} from './analyticsCalculations.ts';
import { Order, Product } from '../types/index.ts';

const mockOrders: Order[] = [
  {
    id: 'ZNV-1001',
    customer: { id: 'c1', name: 'Alice Smith', email: 'alice@example.com' },
    items: [{ productId: 'p1', title: 'Watch', price: 250, quantity: 1, thumbnail: '', sku: 'W-1' }],
    totalAmount: 250,
    subtotal: 250,
    tax: 0,
    shippingFee: 0,
    discountAmount: 0,
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered',
    shippingAddress: { street: '123 Main', city: 'NY', state: 'NY', zip: '10001', country: 'US' },
    timeline: [],
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'ZNV-1002',
    customer: { id: 'c2', name: 'Bob Jones', email: 'bob@example.com' },
    items: [{ productId: 'p2', title: 'Backpack', price: 150, quantity: 1, thumbnail: '', sku: 'B-1' }],
    totalAmount: 150,
    subtotal: 150,
    tax: 0,
    shippingFee: 0,
    discountAmount: 0,
    paymentStatus: 'paid',
    fulfillmentStatus: 'processing',
    shippingAddress: { street: '456 Elm', city: 'SF', state: 'CA', zip: '94101', country: 'US' },
    timeline: [],
    createdAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'ZNV-1003',
    customer: { id: 'c3', name: 'Charlie', email: 'charlie@example.com' },
    items: [{ productId: 'p3', title: 'Lamp', price: 100, quantity: 1, thumbnail: '', sku: 'L-1' }],
    totalAmount: 100,
    subtotal: 100,
    tax: 0,
    shippingFee: 0,
    discountAmount: 0,
    paymentStatus: 'pending', // Pending, not paid
    fulfillmentStatus: 'unfulfilled',
    shippingAddress: { street: '789 Oak', city: 'Chicago', state: 'IL', zip: '60601', country: 'US' },
    timeline: [],
    createdAt: '2026-03-03T10:00:00Z',
  },
];

const mockProducts: Product[] = [
  {
    id: 'p1',
    title: 'Titanium Chronograph Watch',
    sku: 'ZNV-WTC-01',
    category: 'Watches',
    price: 320,
    stock: 25,
    lowStockThreshold: 5,
    status: 'published',
    images: [],
    thumbnail: '',
    description: 'Luxury watch',
    tags: ['luxury', 'titanium'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'p2',
    title: 'Noise Canceling Headphones',
    sku: 'ZNV-AUD-02',
    category: 'Audio',
    price: 240,
    stock: 3, // Low stock (<= 5)
    lowStockThreshold: 5,
    status: 'published',
    images: [],
    thumbnail: '',
    description: 'Graphite headphones',
    tags: ['audio', 'wireless'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'p3',
    title: 'Rolltop Canvas Backpack',
    sku: 'ZNV-BAG-03',
    category: 'Bags',
    price: 180,
    stock: 0, // Out of stock
    lowStockThreshold: 4,
    status: 'draft',
    images: [],
    thumbnail: '',
    description: 'Commuter bag',
    tags: ['travel'],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
];

test('calculateTotalRevenue aggregates paid orders only', () => {
  const revenue = calculateTotalRevenue(mockOrders);
  assert.equal(revenue, 400); // 250 + 150
});

test('calculateAverageOrderValue calculates average for paid orders', () => {
  const aov = calculateAverageOrderValue(mockOrders);
  assert.equal(aov, 200); // 400 / 2
});

test('calculateOrdersByStatus correctly tallies fulfillment states', () => {
  const counts = calculateOrdersByStatus(mockOrders);
  assert.equal(counts.all, 3);
  assert.equal(counts.delivered, 1);
  assert.equal(counts.processing, 1);
  assert.equal(counts.unfulfilled, 1);
  assert.equal(counts.shipped, 0);
});

test('calculateInventoryMetrics classifies stock levels and value accurately', () => {
  const metrics = calculateInventoryMetrics(mockProducts);
  assert.equal(metrics.totalProducts, 3);
  assert.equal(metrics.inStockCount, 1);
  assert.equal(metrics.lowStockCount, 1);
  assert.equal(metrics.outOfStockCount, 1);
  // (320 * 25) + (240 * 3) + (180 * 0) = 8000 + 720 = 8720
  assert.equal(metrics.totalInventoryValue, 8720);
});

test('filterProducts filters by query, category, and stock status', () => {
  const resultsByQuery = filterProducts(mockProducts, 'Watch', 'all', 'all', 'all');
  assert.equal(resultsByQuery.length, 1);
  assert.equal(resultsByQuery[0].id, 'p1');

  const resultsByCategory = filterProducts(mockProducts, '', 'Audio', 'all', 'all');
  assert.equal(resultsByCategory.length, 1);
  assert.equal(resultsByCategory[0].id, 'p2');

  const resultsByLowStock = filterProducts(mockProducts, '', 'all', 'all', 'low_stock');
  assert.equal(resultsByLowStock.length, 1);
  assert.equal(resultsByLowStock[0].id, 'p2');

  const resultsByOutOfStock = filterProducts(mockProducts, '', 'all', 'all', 'out_of_stock');
  assert.equal(resultsByOutOfStock.length, 1);
  assert.equal(resultsByOutOfStock[0].id, 'p3');
});

test('sortProducts sorts correctly by price ascending and descending', () => {
  const asc = sortProducts(mockProducts, 'price', 'asc');
  assert.equal(asc[0].price, 180);
  assert.equal(asc[2].price, 320);

  const desc = sortProducts(mockProducts, 'price', 'desc');
  assert.equal(desc[0].price, 320);
  assert.equal(desc[2].price, 180);
});

test('paginateItems correctly calculates pages and slices array', () => {
  const paged = paginateItems(mockProducts, 1, 2);
  assert.equal(paged.items.length, 2);
  assert.equal(paged.totalPages, 2);
  assert.equal(paged.totalCount, 3);
  assert.equal(paged.currentPage, 1);

  const pageTwo = paginateItems(mockProducts, 2, 2);
  assert.equal(pageTwo.items.length, 1);
  assert.equal(pageTwo.currentPage, 2);
});
