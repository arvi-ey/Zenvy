import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, FulfillmentStatus, PaymentStatus } from '../types/index.ts';
import { INITIAL_ORDERS } from './mockData.ts';

interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  fulfillmentFilter: string;
  paymentFilter: string;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
}

const initialState: OrdersState = {
  items: INITIAL_ORDERS,
  selectedOrder: null,
  fulfillmentFilter: 'all',
  paymentFilter: 'all',
  searchQuery: '',
  currentPage: 1,
  pageSize: 6,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateFulfillmentStatus: (
      state,
      action: PayloadAction<{ id: string; status: FulfillmentStatus; trackingNumber?: string; carrier?: string; note?: string }>
    ) => {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) {
        order.fulfillmentStatus = action.payload.status;
        if (action.payload.trackingNumber) {
          order.trackingNumber = action.payload.trackingNumber;
        }
        if (action.payload.carrier) {
          order.carrier = action.payload.carrier;
        }
        order.timeline.push({
          title: `Status changed to ${action.payload.status.toUpperCase()}`,
          timestamp: new Date().toISOString(),
          note: action.payload.note || (action.payload.trackingNumber ? `Tracking: ${action.payload.trackingNumber}` : undefined),
        });

        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = { ...order };
        }
      }
    },
    updatePaymentStatus: (state, action: PayloadAction<{ id: string; status: PaymentStatus }>) => {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) {
        order.paymentStatus = action.payload.status;
        order.timeline.push({
          title: `Payment marked as ${action.payload.status.toUpperCase()}`,
          timestamp: new Date().toISOString(),
        });
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = { ...order };
        }
      }
    },
    refundOrder: (state, action: PayloadAction<{ id: string; amount: number; reason: string }>) => {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) {
        order.paymentStatus = 'refunded';
        order.fulfillmentStatus = 'cancelled';
        order.timeline.push({
          title: `Refund Processed ($${action.payload.amount.toFixed(2)})`,
          timestamp: new Date().toISOString(),
          note: action.payload.reason,
        });
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = { ...order };
        }
      }
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setFulfillmentFilter: (state, action: PayloadAction<string>) => {
      state.fulfillmentFilter = action.payload;
      state.currentPage = 1;
    },
    setPaymentFilter: (state, action: PayloadAction<string>) => {
      state.paymentFilter = action.payload;
      state.currentPage = 1;
    },
    setOrderSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setOrderPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  updateFulfillmentStatus,
  updatePaymentStatus,
  refundOrder,
  setSelectedOrder,
  setFulfillmentFilter,
  setPaymentFilter,
  setOrderSearchQuery,
  setOrderPage,
} = ordersSlice.actions;

export default ordersSlice.reducer;
