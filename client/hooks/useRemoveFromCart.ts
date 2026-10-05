'use client'

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { deleteProductFromCart } from '@/api/cart'
import { useAppDispatch } from '@/store/hooks'
import { removeProductFromCart } from '@/store/slices/cartSlice'

export function useRemoveFromCart() {
  const dispatch = useAppDispatch()
  const [removingProductId, setRemovingProductId] = useState<string | null>(null)

  const removeItem = async (productId: string) => {
    setRemovingProductId(productId)
    try {
      await deleteProductFromCart(productId)
      dispatch(removeProductFromCart(productId))
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
      setRemovingProductId(null)
    }
  }

  return { removeItem, removingProductId }
}
