'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  User
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  toggleCart,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearch
} from '@/store/slices/uiSlice'
import { selectCartCount } from '@/store/slices/cartSlice'
import { selectWishlistCount } from '@/store/slices/wishlistSlice'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/collections/new-arrivals', label: 'New Arrivals' },
  { href: '/collections/tshirts', label: 'T-Shirts' },
  { href: '/collections/shirts', label: 'Shirts' },
  { href: '/collections/trousers', label: 'Trousers' },
  { href: '/collections/jackets', label: 'Jackets' },
  { href: '/collections/accessories', label: 'Accessories' },
]

export function Header() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const cartCount = useAppSelector(selectCartCount)
  const wishlistCount = useAppSelector(selectWishlistCount)
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">


      {/* Main Header */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="flex items-center justify-center p-2 lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-xl font-bold tracking-wider sm:text-2xl logo-txt"
        >
          Zenvy
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors duration-200 hover:text-primary',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSearch())}
            className="h-9 w-9"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden h-9 w-9 sm:flex"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          <Link href="/account" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Account">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/wishlist" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleCart())}
            className="relative h-9 w-9"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-[calc(3.5rem+2.5rem)] bottom-0 z-40 bg-background transition-transform duration-300 ease-in-out lg:hidden sm:top-[calc(4rem+2.5rem)]',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className={cn(
                'border-b border-border py-4 text-base font-medium transition-colors',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-6 flex items-center gap-4">
            <Link
              href="/account"
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <User className="h-5 w-5" />
              Account
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />
      )}
    </header>
  )
}
