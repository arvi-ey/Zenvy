'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import axios from 'axios'
import { toast } from 'sonner'
import { store } from '@/store'
import { Footer } from '@/components/server/Footer'
import { Header } from '@/components/client/Header'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import { Toaster } from '@/components/ui/sonner'
import { getCart } from '@/api/cart'
import { hydrateCart } from '@/store/slices/cartSlice'
import { hydrateWishlist } from '@/store/slices/wishlistSlice'
import { useAppSelector } from '@/store/hooks'
import type { WishlistItem } from '@/types'

const WISHLIST_STORAGE_KEY = 'zenvy-wishlist'

function isWishlistItem(value: unknown): value is WishlistItem {
  if (typeof value !== 'object' || value === null) return false

  const item = value as Partial<WishlistItem>
  const product = item.product
  return (
    typeof item.addedAt === 'string' &&
    typeof product === 'object' &&
    product !== null &&
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.slug === 'string' &&
    Array.isArray(product.images) &&
    Array.isArray(product.sizes) &&
    Array.isArray(product.colors)
  )
}

function WishlistHydrator() {
  const wishlist = useAppSelector((state) => state.wishlist)

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (!savedWishlist) {
        store.dispatch(hydrateWishlist([]))
        return
      }

      const parsed: unknown = JSON.parse(savedWishlist)
      if (!Array.isArray(parsed) || !parsed.every(isWishlistItem)) {
        throw new Error('Saved wishlist data is invalid.')
      }
      store.dispatch(hydrateWishlist(parsed))
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Unable to restore your wishlist.'
      toast.error(message)
      store.dispatch(hydrateWishlist([]))
    }
  }, [])

  useEffect(() => {
    if (!wishlist.isHydrated) return

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist.items))
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Unable to save your wishlist.'
      toast.error(message)
    }
  }, [wishlist.isHydrated, wishlist.items])

  return null
}

function CartHydrator() {
  useEffect(() => {
    let cancelled = false

    getCart()
      .then((items) => {
        if (!cancelled) store.dispatch(hydrateCart(items))
      })
      .catch((error: unknown) => {
        if (cancelled) return
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

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CartHydrator />
        <WishlistHydrator />
        <Header />
        <CartDrawer />
        <SearchModal />
        <Toaster />
        {children}
        <Footer />
      </ThemeProvider>
    </Provider>
  )
}
