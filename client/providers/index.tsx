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
