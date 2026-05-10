import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Product, UIState } from '@/types'

const initialState: UIState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
  isFilterDrawerOpen: false,
  isQuickViewOpen: false,
  quickViewProduct: null,
  isSearchOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload
    },
    toggleFilterDrawer: (state) => {
      state.isFilterDrawerOpen = !state.isFilterDrawerOpen
    },
    setFilterDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterDrawerOpen = action.payload
    },
    openQuickView: (state, action: PayloadAction<Product>) => {
      state.isQuickViewOpen = true
      state.quickViewProduct = action.payload
    },
    closeQuickView: (state) => {
      state.isQuickViewOpen = false
      state.quickViewProduct = null
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload
    },
  },
})

export const {
  toggleCart,
  setCartOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleFilterDrawer,
  setFilterDrawerOpen,
  openQuickView,
  closeQuickView,
  toggleSearch,
  setSearchOpen,
} = uiSlice.actions

// Selectors
export const selectIsCartOpen = (state: { ui: UIState }) => state.ui.isCartOpen
export const selectIsMobileMenuOpen = (state: { ui: UIState }) =>
  state.ui.isMobileMenuOpen
export const selectIsFilterDrawerOpen = (state: { ui: UIState }) =>
  state.ui.isFilterDrawerOpen
export const selectIsQuickViewOpen = (state: { ui: UIState }) =>
  state.ui.isQuickViewOpen
export const selectQuickViewProduct = (state: { ui: UIState }) =>
  state.ui.quickViewProduct
export const selectIsSearchOpen = (state: { ui: UIState }) =>
  state.ui.isSearchOpen

export default uiSlice.reducer
