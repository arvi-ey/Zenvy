export type ProductStatus = 'published' | 'draft' | 'archived';

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  images: string[];
  thumbnail: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
  sku: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderTimelineEvent {
  title: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. ZNV-8921
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  carrier?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'vip';

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalOrders: number;
  lifetimeValue: number;
  status: CustomerStatus;
  city: string;
  country: string;
  notes: string[];
  joinedAt: string;
  lastOrderAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
  status: 'active' | 'hidden';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  status: 'active' | 'expired' | 'disabled';
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryShare {
  category: string;
  sales: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  salesHistory: SalesDataPoint[];
  categoryBreakdown: CategoryShare[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export type ActiveTab = 'overview' | 'products' | 'orders' | 'customers' | 'categories' | 'coupons' | 'analytics';
