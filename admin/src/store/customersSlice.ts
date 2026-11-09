import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, CustomerStatus } from '../types/index.ts';
import { INITIAL_CUSTOMERS } from './mockData.ts';

interface CustomersState {
  items: Customer[];
  selectedCustomer: Customer | null;
  searchQuery: string;
  statusFilter: string;
}

const initialState: CustomersState = {
  items: INITIAL_CUSTOMERS,
  selectedCustomer: null,
  searchQuery: '',
  statusFilter: 'all',
};

export const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Omit<Customer, 'id' | 'joinedAt' | 'totalOrders' | 'lifetimeValue' | 'lastOrderAt'>>) => {
      const newCustomer: Customer = {
        ...action.payload,
        id: `cust-${Date.now()}`,
        joinedAt: new Date().toISOString(),
        lastOrderAt: new Date().toISOString(),
        totalOrders: 0,
        lifetimeValue: 0,
      };
      state.items.unshift(newCustomer);
    },
    updateCustomer: (state, action: PayloadAction<{ id: string; changes: Partial<Customer> }>) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload.changes };
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = { ...state.items[idx] };
        }
      }
    },
    addCustomerNote: (state, action: PayloadAction<{ customerId: string; note: string }>) => {
      const customer = state.items.find((c) => c.id === action.payload.customerId);
      if (customer) {
        customer.notes.unshift(action.payload.note);
        if (state.selectedCustomer?.id === action.payload.customerId) {
          state.selectedCustomer = { ...customer };
        }
      }
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setCustomerSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCustomerStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  addCustomer,
  updateCustomer,
  addCustomerNote,
  setSelectedCustomer,
  setCustomerSearchQuery,
  setCustomerStatusFilter,
} = customersSlice.actions;

export default customersSlice.reducer;
