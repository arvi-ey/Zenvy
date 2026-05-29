import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { mockOrders } from "@/constants/mockData";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: OrderStatus;
  items: number;
  createdAt: string;
  paymentMethod: string;
  shippingAddress: string;
}

interface State { list: Order[]; }
const initialState: State = { list: mockOrders };

const slice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: {
      reducer(state, action: PayloadAction<Order>) { state.list.unshift(action.payload); },
      prepare(payload: Omit<Order, "id" | "createdAt">) {
        return { payload: { ...payload, id: `ORD-${nanoid(6).toUpperCase()}`, createdAt: new Date().toISOString() } };
      },
    },
    updateOrder(state, action: PayloadAction<Order>) {
      const i = state.list.findIndex((o) => o.id === action.payload.id);
      if (i >= 0) state.list[i] = action.payload;
    },
    updateOrderStatus(state, action: PayloadAction<{ id: string; status: OrderStatus }>) {
      const o = state.list.find((x) => x.id === action.payload.id);
      if (o) o.status = action.payload.status;
    },
    deleteOrder(state, action: PayloadAction<string>) {
      state.list = state.list.filter((o) => o.id !== action.payload);
    },
  },
});

export const { addOrder, updateOrder, updateOrderStatus, deleteOrder } = slice.actions;
export default slice.reducer;
