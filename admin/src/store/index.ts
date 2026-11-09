import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import productsReducer from './productsSlice.ts';
import ordersReducer from './ordersSlice.ts';
import customersReducer from './customersSlice.ts';
import { categoriesSlice, couponsSlice } from './categoriesAndCouponsSlice.ts';
import uiReducer from './uiSlice.ts';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    customers: customersReducer,
    categories: categoriesSlice.reducer,
    coupons: couponsSlice.reducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
