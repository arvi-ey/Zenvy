import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { ThemeProvider } from './components/theme-provider.tsx'
import { router } from './app/router.tsx'
import { RouterProvider } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="zenvy-theme"
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
