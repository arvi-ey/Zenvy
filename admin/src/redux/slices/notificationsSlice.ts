import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { mockNotifications } from "@/constants/mockData";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  channel: "email" | "whatsapp";
  audience: string;
  status: "draft" | "scheduled" | "sent";
  createdAt: string;
}

const slice = createSlice({
  name: "notifications",
  initialState: { list: mockNotifications as NotificationItem[] },
  reducers: {
    addNotification: {
      reducer(state, action: PayloadAction<NotificationItem>) { state.list.unshift(action.payload); },
      prepare(payload: Omit<NotificationItem, "id" | "createdAt">) {
        return { payload: { ...payload, id: `NTF-${nanoid(5).toUpperCase()}`, createdAt: new Date().toISOString() } };
      },
    },
    updateNotification(state, action: PayloadAction<NotificationItem>) {
      const i = state.list.findIndex((x) => x.id === action.payload.id);
      if (i >= 0) state.list[i] = action.payload;
    },
    deleteNotification(state, action: PayloadAction<string>) { state.list = state.list.filter((x) => x.id !== action.payload); },
  },
});
export const { addNotification, updateNotification, deleteNotification } = slice.actions;
export default slice.reducer;
