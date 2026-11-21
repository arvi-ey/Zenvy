'use client'

import { useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectFilters } from '@/store/slices/filterSlice'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const filters = useAppSelector(selectFilters)

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category))
    }

    // Apply size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some(
          (size) =>
            filters.sizes.includes(size.value.toLowerCase()) && size.inStock
        )
      )
    }

    // Apply price filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        // In a real app, you'd sort by date
        result = result.reverse()
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [products, filters])

  if (filteredAndSortedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-5">
      {filteredAndSortedProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 6} />
      ))}
    </div>
  )
}
