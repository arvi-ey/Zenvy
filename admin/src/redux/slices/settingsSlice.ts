import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MenuKey = "analytics" | "orders" | "users" | "items" | "categories" | "notifications" | "settings" | "profile";

interface SettingsState {
  menuVisibility: Record<MenuKey, boolean>;
  businessName: string;
  currency: "USD" | "EUR" | "GBP" | "INR";
  timezone: string;
}

const initial: SettingsState = {
  menuVisibility: {
    analytics: true, orders: true, users: true, items: true,
    categories: true, notifications: true, settings: true, profile: true,
  },
  businessName: "Northstar Commerce",
  currency: "USD",
  timezone: "UTC-05:00",
};

const persisted = typeof window !== "undefined" ? localStorage.getItem("settings.state") : null;
const initialState: SettingsState = persisted ? { ...initial, ...JSON.parse(persisted) } : initial;

function persist(state: SettingsState) {
  if (typeof window !== "undefined") localStorage.setItem("settings.state", JSON.stringify(state));
}

const slice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleMenu(state, action: PayloadAction<MenuKey>) {
      state.menuVisibility[action.payload] = !state.menuVisibility[action.payload];
      persist(state);
    },
    setBusinessName(state, action: PayloadAction<string>) { state.businessName = action.payload; persist(state); },
    setCurrency(state, action: PayloadAction<SettingsState["currency"]>) { state.currency = action.payload; persist(state); },
    setTimezone(state, action: PayloadAction<string>) { state.timezone = action.payload; persist(state); },
  },
});

export const { toggleMenu, setBusinessName, setCurrency, setTimezone } = slice.actions;
export default slice.reducer;
