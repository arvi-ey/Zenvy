import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import filterReducer from './slices/filterSlice'
import checkoutReducer from './slices/checkoutSlice'
import uiReducer from './slices/uiSlice'
import ProductReducer from "./slices/productSlicer"
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    filters: filterReducer,
    checkout: checkoutReducer,
    ui: uiReducer,
    product: ProductReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
