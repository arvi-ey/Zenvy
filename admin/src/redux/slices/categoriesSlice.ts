import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { mockCategories } from "@/constants/mockData";

export interface Category { id: string; name: string; description: string; itemCount: number; }

const slice = createSlice({
  name: "categories",
  initialState: { list: mockCategories as Category[] },
  reducers: {
    addCategory: {
      reducer(state, action: PayloadAction<Category>) { state.list.unshift(action.payload); },
      prepare(payload: Omit<Category, "id">) { return { payload: { ...payload, id: `CAT-${nanoid(4).toUpperCase()}` } }; },
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const i = state.list.findIndex((x) => x.id === action.payload.id);
      if (i >= 0) state.list[i] = action.payload;
    },
    deleteCategory(state, action: PayloadAction<string>) { state.list = state.list.filter((x) => x.id !== action.payload); },
  },
});
export const { addCategory, updateCategory, deleteCategory } = slice.actions;
export default slice.reducer;
