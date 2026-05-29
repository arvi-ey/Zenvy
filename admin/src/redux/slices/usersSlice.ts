import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockUsers } from "@/constants/mockData";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Customer" | "Support";
  status: "active" | "invited" | "suspended";
  joined: string;
  spend: number;
  country: string;
}

const slice = createSlice({
  name: "users",
  initialState: { list: mockUsers as AppUser[] },
  reducers: {
    addUser(state, action: PayloadAction<AppUser>) { state.list.unshift(action.payload); },
    updateUser(state, action: PayloadAction<AppUser>) {
      const i = state.list.findIndex((u) => u.id === action.payload.id);
      if (i >= 0) state.list[i] = action.payload;
    },
    deleteUser(state, action: PayloadAction<string>) { state.list = state.list.filter((u) => u.id !== action.payload); },
  },
});
export const { addUser, updateUser, deleteUser } = slice.actions;
export default slice.reducer;
