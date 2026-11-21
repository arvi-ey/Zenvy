'use client'

import { useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { getCart } from '@/api/cart'
import { store } from '@/store'
import { hydrateCart } from '@/store/slices/cartSlice'

function CartHydrator() {
  useEffect(() => {
    let cancelled = false

    getCart()
      .then((items) => {
        if (!cancelled) store.dispatch(hydrateCart(items))
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(error) && error.response?.status === 401) return
        const message = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message ?? 'Unable to restore your cart.'
          : error instanceof Error
            ? error.message
            : 'Unable to restore your cart.'
        toast.error(message)
      })

    return () => { cancelled = true }
  }, [])

  return null
}

export default CartHydrator
