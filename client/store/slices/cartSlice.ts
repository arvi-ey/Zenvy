import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isLoading: boolean
}

const initialState: CartState = {
  items: [],
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
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
        existingItem.quantity += quantity
      } else {
        state.items.push({ product, quantity, selectedSize, selectedColor })
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
        item.quantity = Math.max(1, quantity)
      }
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

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
