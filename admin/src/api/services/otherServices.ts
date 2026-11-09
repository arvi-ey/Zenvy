import { apiClient } from '../axiosClient.ts';
import { Customer, Category, Coupon, AnalyticsSummary } from '../../types/index.ts';

export const customerService = {
  async getCustomers(params?: { query?: string; status?: string }): Promise<{ data: Customer[]; total: number }> {
    return apiClient.get('/customers', { params });
  },

  async getCustomerById(id: string): Promise<Customer> {
    return apiClient.get(`/customers/${id}`);
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    return apiClient.post('/customers', customerData);
  },

  async addNote(id: string, note: string): Promise<Customer> {
    return apiClient.post(`/customers/${id}/notes`, { note });
  },
};

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const categories = await apiClient.get<Array<{
      id: number;
      name: string;
      slug: string;
      image: string;
      status: 'active' | 'inactive';
    }>>('/product-category/admin-list');
    return categories.map((category) => ({
      id: String(category.id),
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: '',
      productCount: 0,
      status: category.status === 'active' ? 'active' : 'hidden',
    }));
  },

  async createCategory(data: Pick<Category, 'name' | 'image'>): Promise<Category> {
    const category = await apiClient.post<{
      id: number;
      name: string;
      slug: string;
      image: string;
      status: 'active' | 'inactive';
    }>('/product-category/create', data);
    return {
      id: String(category.id),
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: '',
      productCount: 0,
      status: category.status === 'active' ? 'active' : 'hidden',
    };
  },

  async updateCategory(id: string, updates: Pick<Category, 'name' | 'image'>): Promise<Category> {
    const category = await apiClient.put<{
      id: number;
      name: string;
      slug: string;
      image: string;
      status: 'active' | 'inactive';
    }>(`/product-category/${id}`, updates);
    return {
      id: String(category.id),
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: '',
      productCount: 0,
      status: category.status === 'active' ? 'active' : 'hidden',
    };
  },

  async deleteCategory(id: string): Promise<{ success: boolean; id: string }> {
    await apiClient.delete(`/product-category/${id}`);
    return { success: true, id };
  },
};

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    return apiClient.get('/coupons');
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    return apiClient.post('/coupons', data);
  },

  async toggleCouponStatus(id: string, status: Coupon['status']): Promise<Coupon> {
    return apiClient.patch(`/coupons/${id}/status`, { status });
  },

  async deleteCoupon(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete(`/coupons/${id}`);
  },
};

export const analyticsService = {
  async getDashboardSummary(timeframe: '7d' | '30d' | '90d' | '12m'): Promise<AnalyticsSummary> {
    return apiClient.get('/analytics/summary', { params: { timeframe } });
  },
};
