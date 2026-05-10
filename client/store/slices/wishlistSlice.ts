import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Product, WishlistItem } from '@/types'

interface WishlistState {
  items: WishlistItem[]
}

const initialState: WishlistState = {
  items: [],
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.some(
        (item) => item.product.id === action.payload.id
      )
      if (!exists) {
        state.items.push({
          product: action.payload,
          addedAt: new Date().toISOString(),
        })
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      )
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(
        (item) => item.product.id === action.payload.id
      )
      if (index > -1) {
        state.items.splice(index, 1)
      } else {
        state.items.push({
          product: action.payload,
          addedAt: new Date().toISOString(),
        })
      }
    },
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items
export const selectWishlistCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length
export const selectIsInWishlist = (productId: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((item) => item.product.id === productId)

export default wishlistSlice.reducer
