'use client'

import { useEffect } from 'react'
import axios from 'axios'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
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
import api from '@/api/api'
import { getCurrentUser } from '@/api/auth'
import { setAuthenticated, setUnauthenticated } from '@/store/slices/authSlice'

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

function AuthHydrator() {
  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((user) => {
        if (!cancelled) store.dispatch(setAuthenticated(user))
      })
      .catch((error: unknown) => {
        if (cancelled) return
        store.dispatch(setUnauthenticated())
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
          toast.error(error.response?.data?.message ?? 'Unable to restore your session.')
        } else if (!axios.isAxiosError(error)) {
          toast.error(error instanceof Error ? error.message : 'Unable to restore your session.')
        }
      })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let refreshPromise: Promise<void> | null = null
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          return Promise.reject(error)
        }

        const request = error.config
        const url = request?.url ?? ''
        if (
          !request ||
          url.includes('/auth/sign-in') ||
          url.includes('/auth/sign-up') ||
          url.includes('/auth/refresh') ||
          url.includes('/auth/sign-out')
        ) {
          return Promise.reject(error)
        }
        if (request.headers['x-auth-retry']) {
          store.dispatch(setUnauthenticated())
          return Promise.reject(error)
        }

        request.headers['x-auth-retry'] = 'true'
        try {
          refreshPromise ??= api.post('/auth/refresh').then(() => undefined).finally(() => {
            refreshPromise = null
          })
          await refreshPromise
          return api(request)
        } catch (refreshError) {
          store.dispatch(setUnauthenticated())
          return Promise.reject(refreshError)
        }
      }
    )
    return () => api.interceptors.response.eject(interceptorId)
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
        <AuthHydrator />
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
