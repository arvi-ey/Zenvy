'use client'

import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import { store } from '@/store'
import { Footer } from '@/components/server/Footer'
import { Header } from '@/components/client/Header'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'

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
        <Header />
        <CartDrawer />
        <SearchModal />
        {children}
        <Footer />
      </ThemeProvider>
    </Provider>
  )
}
