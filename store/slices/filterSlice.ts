import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { FilterState, ProductCategory, SortOption } from '@/types'

const initialState: FilterState = {
  categories: [],
  sizes: [],
  priceRange: [0, 1000],
  sortBy: 'featured',
  searchQuery: '',
}

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<ProductCategory[]>) => {
      state.categories = action.payload
    },
    toggleCategory: (state, action: PayloadAction<ProductCategory>) => {
      const index = state.categories.indexOf(action.payload)
      if (index > -1) {
        state.categories.splice(index, 1)
      } else {
        state.categories.push(action.payload)
      }
    },
    setSizes: (state, action: PayloadAction<string[]>) => {
      state.sizes = action.payload
    },
    toggleSize: (state, action: PayloadAction<string>) => {
      const index = state.sizes.indexOf(action.payload)
      if (index > -1) {
        state.sizes.splice(index, 1)
      } else {
        state.sizes.push(action.payload)
      }
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    resetFilters: (state) => {
      state.categories = []
      state.sizes = []
      state.priceRange = [0, 1000]
      state.sortBy = 'featured'
      state.searchQuery = ''
    },
  },
})

export const {
  setCategories,
  toggleCategory,
  setSizes,
  toggleSize,
  setPriceRange,
  setSortBy,
  setSearchQuery,
  resetFilters,
} = filterSlice.actions

// Selectors
export const selectFilters = (state: { filters: FilterState }) => state.filters
export const selectActiveFilterCount = (state: { filters: FilterState }) => {
  let count = 0
  if (state.filters.categories.length > 0) count++
  if (state.filters.sizes.length > 0) count++
  if (state.filters.priceRange[0] > 0 || state.filters.priceRange[1] < 1000) count++
  return count
}

export default filterSlice.reducer
