import axios from 'axios'
import api from '@/api/api'

export interface OrderItem {
  id?: number
  productId: number
  variantId: number
  name: string
  image: string | null
  quantity: number
  unitPrice: number
  selectedSize: string
  selectedColor: string
}

export interface Order {
  id: number
  status: 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentMethod: 'cod'
  subtotal: number
  deliveryCharge: number
  total: number
  createdAt: string
  address?: {
    street: string
    landmark: string | null
    district: string
    state: string
    pincode: string
    type: 'home' | 'office' | 'others'
  }
  items: OrderItem[]
}

interface OrderResponse {
  success: boolean
  message: string
  data: Order
}

function getOrderRequestError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data?.message || fallback)
  }
  return error instanceof Error ? error : new Error(fallback)
}

export async function createCashOnDeliveryOrder(
  addressId: number,
  variantIds?: number[],
  selectedColors?: { variant_id: number; selected_color: string }[]
) {
  try {
    const response = await api.post<OrderResponse>('/orders', {
      address_id: addressId,
      payment_method: 'cod',
      ...(variantIds ? { variant_ids: variantIds } : {}),
      ...(selectedColors ? { selected_colors: selectedColors } : {}),
    })
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Unable to place your order.')
    }
    return response.data.data
  } catch (error: unknown) {
    throw getOrderRequestError(error, 'Unable to place your order.')
  }
}

export async function getOrders() {
  try {
    const response = await api.get<{ success: boolean; message: string; data: Order[] }>('/orders')
    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error(response.data.message || 'Unable to load your orders.')
    }
    return response.data.data
  } catch (error: unknown) {
    throw getOrderRequestError(error, 'Unable to load your orders.')
  }
}

export async function getOrder(orderId: number): Promise<Order> {
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error('Invalid order')
  }
  try {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Unable to load this order.')
    }
    return response.data.data
  } catch (error: unknown) {
    throw getOrderRequestError(error, 'Unable to load this order.')
  }
}

export async function cancelOrder(orderId: number): Promise<Order> {
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error('Invalid order')
  }
  try {
    const response = await api.post<OrderResponse>(`/orders/${orderId}/cancel`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Unable to cancel this order.')
    }
    return response.data.data
  } catch (error: unknown) {
    throw getOrderRequestError(error, 'Unable to cancel this order.')
  }
}
