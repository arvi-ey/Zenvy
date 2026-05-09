'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSearchOpen } from '@/store/slices/uiSlice'
import { products } from '@/data/products'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

export function SearchModal() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.isSearchOpen)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])

  const searchProducts = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setResults(filtered.slice(0, 6))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, searchProducts])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(setSearchOpen(false))
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, dispatch])

  const handleClose = () => {
    dispatch(setSearchOpen(false))
    setQuery('')
    setResults([])
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32 transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:-top-16"
          aria-label="Close search"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 bg-card pl-12 pr-4 text-base shadow-lg sm:h-16 sm:text-lg"
            autoFocus
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-lg">
            <p className="mb-3 text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 && 's'} found
            </p>
            <ul className="space-y-3">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={handleClose}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {product.category}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(product.price)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={handleClose}
              className="mt-4 block text-center text-sm font-medium text-primary transition-colors hover:underline"
            >
              View all results
            </Link>
          </div>
        )}

        {/* No Results */}
        {query.trim() && results.length === 0 && (
          <div className="mt-4 rounded-lg border border-border bg-card p-8 text-center shadow-lg">
            <p className="text-muted-foreground">
              No products found for &quot;{query}&quot;
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching with different keywords
            </p>
          </div>
        )}

        {/* Popular Searches */}
        {!query && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-lg">
            <p className="mb-3 text-sm font-medium">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['T-Shirts', 'Shirts', 'Trousers', 'New Arrivals', 'Sale'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
