import api from '@/api/api'
import type { CartItem } from '@/types'

export interface OrderItem {
  productId: number
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
  items: OrderItem[]
}

export async function createCashOnDeliveryOrder(addressId: number, items: CartItem[]) {
  const response = await api.post<{ success: boolean; message: string; data: Order }>('/orders', {
    address_id: addressId,
    payment_method: 'cod',
    items: items.map((item) => ({
      product_id: Number(item.product.id),
      quantity: item.quantity,
      selected_size: item.selectedSize,
      selected_color: item.selectedColor,
    })),
  })
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Unable to place your order.')
  }
  return response.data.data
}

export async function getOrders() {
  const response = await api.get<{ success: boolean; message: string; data: Order[] }>('/orders')
  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || 'Unable to load your orders.')
  }
  return response.data.data
}
