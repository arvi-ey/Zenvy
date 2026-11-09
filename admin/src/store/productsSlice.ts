import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductStatus } from '../types/index.ts';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  stockFilter: string;
  sortBy: 'title' | 'price' | 'stock' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  selectedIds: string[];
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  searchQuery: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  stockFilter: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentPage: 1,
  pageSize: 6,
  selectedIds: [],
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    replaceProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    upsertProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((product) => product.id === action.payload.id);
      if (index === -1) {
        state.items.unshift(action.payload);
      } else {
        state.items[index] = action.payload;
      }
    },
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProduct: Product = {
        ...action.payload,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.items.unshift(newProduct);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; changes: Partial<Product> }>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload.changes,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null;
      }
    },
    bulkDeleteProducts: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      state.items = state.items.filter((p) => !idsToDelete.has(p.id));
      state.selectedIds = [];
    },
    bulkUpdateStatus: (state, action: PayloadAction<{ ids: string[]; status: ProductStatus }>) => {
      const idSet = new Set(action.payload.ids);
      for (const p of state.items) {
        if (idSet.has(p.id)) {
          p.status = action.payload.status;
          p.updatedAt = new Date().toISOString();
        }
      }
      state.selectedIds = [];
    },
    toggleSelectId: (state, action: PayloadAction<string>) => {
      if (state.selectedIds.includes(action.payload)) {
        state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
      } else {
        state.selectedIds.push(action.payload);
      }
    },
    toggleSelectAll: (state, action: PayloadAction<string[]>) => {
      if (state.selectedIds.length === action.payload.length) {
        state.selectedIds = [];
      } else {
        state.selectedIds = [...action.payload];
      }
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setStockFilter: (state, action: PayloadAction<string>) => {
      state.stockFilter = action.payload;
      state.currentPage = 1;
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: 'title' | 'price' | 'stock' | 'createdAt'; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.categoryFilter = 'all';
      state.statusFilter = 'all';
      state.stockFilter = 'all';
      state.currentPage = 1;
    },
  },
});

export const {
  replaceProducts,
  upsertProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateStatus,
  toggleSelectId,
  toggleSelectAll,
  clearSelection,
  setSelectedProduct,
  setSearchQuery,
  setCategoryFilter,
  setStatusFilter,
  setStockFilter,
  setSorting,
  setCurrentPage,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
