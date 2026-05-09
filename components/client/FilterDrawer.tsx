'use client'

import { X, SlidersHorizontal } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilterDrawerOpen } from '@/store/slices/uiSlice'
import { 
  toggleCategory, 
  toggleSize, 
  setPriceRange, 
  resetFilters,
  selectFilters 
} from '@/store/slices/filterSlice'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/types'

const categories: { id: ProductCategory; label: string }[] = [
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'shirts', label: 'Shirts' },
  { id: 'trousers', label: 'Trousers' },
  { id: 'jackets', label: 'Jackets' },
  { id: 'accessories', label: 'Accessories' },
]

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function FilterDrawer() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.isFilterDrawerOpen)
  const filters = useAppSelector(selectFilters)

  const formatPrice = (price: number) => `$${price}`

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        variant="outline"
        onClick={() => dispatch(setFilterDrawerOpen(true))}
        className="flex items-center gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => dispatch(setFilterDrawerOpen(false))}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-xl border-t border-border bg-background transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => dispatch(setFilterDrawerOpen(false))}
              className="rounded-full p-1 transition-colors hover:bg-muted"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="overflow-y-auto p-4">
            <FilterContent
              filters={filters}
              onToggleCategory={(cat) => dispatch(toggleCategory(cat))}
              onToggleSize={(size) => dispatch(toggleSize(size))}
              onSetPriceRange={(range) => dispatch(setPriceRange(range))}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => dispatch(resetFilters())}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                onClick={() => dispatch(setFilterDrawerOpen(false))}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-32 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => dispatch(resetFilters())}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <FilterContent
            filters={filters}
            onToggleCategory={(cat) => dispatch(toggleCategory(cat))}
            onToggleSize={(size) => dispatch(toggleSize(size))}
            onSetPriceRange={(range) => dispatch(setPriceRange(range))}
          />
        </div>
      </aside>
    </>
  )
}

interface FilterContentProps {
  filters: ReturnType<typeof selectFilters>
  onToggleCategory: (category: ProductCategory) => void
  onToggleSize: (size: string) => void
  onSetPriceRange: (range: [number, number]) => void
}

function FilterContent({
  filters,
  onToggleCategory,
  onToggleSize,
  onSetPriceRange,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Category</h3>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <Checkbox
                checked={filters.categories.includes(category.id)}
                onCheckedChange={() => onToggleCategory(category.id)}
              />
              <span className="text-sm">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onToggleSize(size.toLowerCase())}
              className={cn(
                'flex h-9 w-12 items-center justify-center rounded-md border text-sm transition-colors',
                filters.sizes.includes(size.toLowerCase())
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Price Range</h3>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => onSetPriceRange(value as [number, number])}
          min={0}
          max={1000}
          step={10}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(filters.priceRange[0])}</span>
          <span>{formatPrice(filters.priceRange[1])}</span>
        </div>
      </div>
    </div>
  )

  function formatPrice(price: number) {
    return `$${price}`
  }
}
