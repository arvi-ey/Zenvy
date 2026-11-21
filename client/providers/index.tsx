'use client'

import { Provider } from 'react-redux'
import { ThemeProvider } from '@/components/theme-provider'
import { store } from '@/store'
import { Footer } from '@/components/server/Footer'
import { Header } from '@/components/client/Header'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import { Toaster } from '@/components/ui/sonner'
import AuthHydrator from '@/components/client/AuthHydrator'
import CartHydrator from '@/components/client/CartHydrator'
import WishlistHydrator from '@/components/client/WishlistHydrator'

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
