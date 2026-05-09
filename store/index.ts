import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import filterReducer from './slices/filterSlice'
import checkoutReducer from './slices/checkoutSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    filters: filterReducer,
    checkout: checkoutReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
