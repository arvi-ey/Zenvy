import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, Coupon } from '../types/index.ts';
import { INITIAL_COUPONS } from './mockData.ts';

// Categories Slice
interface CategoriesState {
  items: Category[];
}

const initialCategoriesState: CategoriesState = {
  items: [],
};

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState: initialCategoriesState,
  reducers: {
    replaceCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
    },
    upsertCategory: (state, action: PayloadAction<Category>) => {
      const index = state.items.findIndex((category) => category.id === action.payload.id);
      if (index === -1) {
        state.items.push(action.payload);
      } else {
        state.items[index] = action.payload;
      }
    },
    addCategory: (state, action: PayloadAction<Omit<Category, 'id' | 'productCount'>>) => {
      const newCategory: Category = {
        ...action.payload,
        id: `cat-${Date.now()}`,
        productCount: 0,
      };
      state.items.push(newCategory);
    },
    updateCategory: (state, action: PayloadAction<{ id: string; changes: Partial<Category> }>) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload.changes };
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
});

export const {
  replaceCategories,
  upsertCategory,
  addCategory,
  updateCategory,
  deleteCategory,
} = categoriesSlice.actions;

// Coupons Slice
interface CouponsState {
  items: Coupon[];
}

const initialCouponsState: CouponsState = {
  items: INITIAL_COUPONS,
};

export const couponsSlice = createSlice({
  name: 'coupons',
  initialState: initialCouponsState,
  reducers: {
    addCoupon: (state, action: PayloadAction<Omit<Coupon, 'id' | 'usageCount'>>) => {
      const newCoupon: Coupon = {
        ...action.payload,
        id: `coup-${Date.now()}`,
        usageCount: 0,
      };
      state.items.unshift(newCoupon);
    },
    toggleCouponStatus: (state, action: PayloadAction<{ id: string; status: Coupon['status'] }>) => {
      const coupon = state.items.find((c) => c.id === action.payload.id);
      if (coupon) {
        coupon.status = action.payload.status;
      }
    },
    deleteCoupon: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCoupon, toggleCouponStatus, deleteCoupon } = couponsSlice.actions;
