import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isHydrated: boolean
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  isHydrated: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      const merged = new Map<string, CartItem>()
      for (const item of [...action.payload, ...state.items]) {
        const key = `${item.product.id}:${item.selectedSize}:${item.selectedColor}`
        const existing = merged.get(key)
        if (existing) {
          existing.quantity = Math.max(existing.quantity, item.quantity)
        } else {
          merged.set(key, item)
        }
      }
      state.items = [...merged.values()]
      state.isHydrated = true
    },
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product
        quantity: number
        selectedSize: string
        selectedColor: string
      }>
    ) => {
      const { product, quantity, selectedSize, selectedColor } = action.payload
      const existingItem = state.items.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      )

      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + quantity, 10)
      } else {
        state.items.push({
          product,
          quantity: Math.min(quantity, 10),
          selectedSize,
          selectedColor,
        })
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{
        productId: string
        selectedSize: string
        selectedColor: string
      }>
    ) => {
      const { productId, selectedSize, selectedColor } = action.payload
      state.items = state.items.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      )
    },
    removeProductFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      )
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string
        selectedSize: string
        selectedColor: string
        quantity: number
      }>
    ) => {
      const { productId, selectedSize, selectedColor, quantity } = action.payload
      const item = state.items.find(
        (item) =>
          item.product.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      )
      if (item) {
        item.quantity = Math.min(10, Math.max(1, quantity))
      }
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  removeProductFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0)

export default cartSlice.reducer
