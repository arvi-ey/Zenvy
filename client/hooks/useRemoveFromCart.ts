'use client'

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { deleteProductFromCart } from '@/api/cart'
import { useAppDispatch } from '@/store/hooks'
import { removeFromCart } from '@/store/slices/cartSlice'

export function useRemoveFromCart() {
  const dispatch = useAppDispatch()
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null)

  const removeItem = async (productId: string, variantId: number, selectedSize: string, selectedColor: string) => {
    const itemKey = `${productId}:${variantId}`
    setRemovingItemKey(itemKey)
    try {
      await deleteProductFromCart(productId, variantId)
      dispatch(removeFromCart({ productId, selectedSize, selectedColor }))
      return true
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? 'Unable to remove this item from your cart.'
        : error instanceof Error
          ? error.message
          : 'Unable to remove this item from your cart.'
      toast.error(message)
      return false
    } finally {
      setRemovingItemKey(null)
    }
  }

  return { removeItem, removingItemKey }
}
