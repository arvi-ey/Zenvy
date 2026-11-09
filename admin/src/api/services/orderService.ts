import { apiClient } from '../axiosClient.ts';
import { Order, FulfillmentStatus, PaymentStatus } from '../../types/index.ts';

export interface OrderFilters {
  query?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const orderService = {
  async getOrders(params?: OrderFilters): Promise<{ data: Order[]; total: number }> {
    return apiClient.get('/orders', { params });
  },

  async getOrderById(id: string): Promise<Order> {
    return apiClient.get(`/orders/${id}`);
  },

  async updateOrderStatus(id: string, fulfillmentStatus: FulfillmentStatus, trackingNumber?: string, note?: string): Promise<Order> {
    return apiClient.patch(`/orders/${id}/status`, { fulfillmentStatus, trackingNumber, note });
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    return apiClient.patch(`/orders/${id}/payment`, { paymentStatus });
  },

  async refundOrder(id: string, amount: number, reason: string): Promise<Order> {
    return apiClient.post(`/orders/${id}/refund`, { amount, reason });
  },
};
