'use client'

import { ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSortBy, selectFilters } from '@/store/slices/filterSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { SortOption } from '@/types'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export function SortDropdown() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)

  const currentLabel = sortOptions.find((o) => o.value === filters.sortBy)?.label || 'Sort'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentLabel}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => dispatch(setSortBy(option.value))}
            className={filters.sortBy === option.value ? 'bg-muted' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
