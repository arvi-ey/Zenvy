import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { mockItems } from "@/constants/mockData";

export interface Item {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  description?: string;
  images?: string[];
}

const slice = createSlice({
  name: "items",
  initialState: { list: mockItems as Item[] },
  reducers: {
    addItem: {
      reducer(state, action: PayloadAction<Item>) { state.list.unshift(action.payload); },
      prepare(payload: Omit<Item, "id">) { return { payload: { ...payload, id: `ITM-${nanoid(5).toUpperCase()}` } }; },
    },
    updateItem(state, action: PayloadAction<Item>) {
      const i = state.list.findIndex((x) => x.id === action.payload.id);
      if (i >= 0) state.list[i] = action.payload;
    },
    deleteItem(state, action: PayloadAction<string>) { state.list = state.list.filter((x) => x.id !== action.payload); },
  },
});
export const { addItem, updateItem, deleteItem } = slice.actions;
export default slice.reducer;
