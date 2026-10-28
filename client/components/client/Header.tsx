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
  User,
  LogOut
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  toggleCart,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearch
} from '@/store/slices/uiSlice'
import { selectCartCount } from '@/store/slices/cartSlice'
import { selectWishlistCount } from '@/store/slices/wishlistSlice'
import { setUnauthenticated } from '@/store/slices/authSlice'
import { signOut } from '@/api/auth'
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
  const authUser = useAppSelector((state) => state.auth.user)
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen)
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    try {
      await signOut()
      dispatch(setUnauthenticated())
      dispatch(setMobileMenuOpen(false))
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
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
          className="logo-txt flex items-center text-lg tracking-[0.16em] transition-opacity hover:opacity-75 sm:text-xl"
        >
          Zenvy
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSearch())}
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden h-10 w-10 rounded-full text-muted-foreground hover:text-foreground sm:flex"
            aria-label="Toggle theme"
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          {authUser ? (
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-full border border-border/80 py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors hover:bg-secondary sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {authUser.firstName.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-20 truncate">{authUser.firstName}</span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden items-center gap-2 rounded-full border border-border/80 px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:flex"
            >
              <User className="h-4 w-4" />
              Sign in
            </Link>
          )}
          {authUser && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-10 w-10 rounded-full text-muted-foreground hover:text-foreground sm:flex"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOut className="h-[18px] w-[18px]" />
            </Button>
          )}

          <Link href="/wishlist" className="relative rounded-full">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleCart())}
            className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <nav className="hidden border-t border-border/60 lg:block" aria-label="Main navigation">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-8 px-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex h-full items-center text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  isActive && 'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-background transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col p-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shop</p>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className={cn(
                'flex items-center justify-between border-b border-border/70 py-4 text-sm font-semibold transition-colors',
                pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
              <span className="text-muted-foreground">↗</span>
            </Link>
          ))}

          <div className="mt-8 grid gap-2 border-t border-border pt-6">
            {authUser ? (
              <>
                <Link
                  href="/account"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  My account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Sign in
              </Link>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary"
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
