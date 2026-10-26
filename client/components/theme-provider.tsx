'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
  systemTheme: ResolvedTheme
  themes: Theme[]
}

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: 'class'
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => undefined,
  resolvedTheme: 'light',
  systemTheme: 'light',
  themes: ['light', 'dark', 'system'],
})

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    try {
      localStorage.setItem('theme', nextTheme)
    } catch (error: unknown) {
      console.error('Unable to save the selected theme.', error)
    }
  }, [])

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme')
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        setThemeState(storedTheme)
      }
    } catch (error: unknown) {
      console.error('Unable to restore the selected theme.', error)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = () => setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)

    const updateThemeFromStorage = (event: StorageEvent) => {
      if (event.key !== 'theme') return
      const nextTheme = event.newValue
      if (nextTheme === 'light' || nextTheme === 'dark' || nextTheme === 'system') {
        setThemeState(nextTheme)
      } else if (nextTheme === null) {
        setThemeState(defaultTheme)
      }
    }
    window.addEventListener('storage', updateThemeFromStorage)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
      window.removeEventListener('storage', updateThemeFromStorage)
    }
  }, [defaultTheme, mounted])

  const resolvedTheme = theme === 'system' && enableSystem ? systemTheme : theme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme
  }, [mounted, resolvedTheme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        systemTheme,
        themes: enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark'],
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
