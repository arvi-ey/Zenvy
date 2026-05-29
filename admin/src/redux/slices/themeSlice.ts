import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeAccent = "indigo" | "cyan" | "violet" | "emerald" | "rose" | "amber" | "sunset" | "teal" | "crimson" | "slate" | "fuchsia" | "lime";

interface ThemeState {
  mode: ThemeMode;
  accent: ThemeAccent;
}

const initialState: ThemeState = {
  mode: (typeof window !== "undefined" && (localStorage.getItem("theme.mode") as ThemeMode)) || "system",
  accent: (typeof window !== "undefined" && (localStorage.getItem("theme.accent") as ThemeAccent)) || "indigo",
};

const slice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      if (typeof window !== "undefined") localStorage.setItem("theme.mode", action.payload);
    },
    setAccent(state, action: PayloadAction<ThemeAccent>) {
      state.accent = action.payload;
      if (typeof window !== "undefined") localStorage.setItem("theme.accent", action.payload);
    },
  },
});

export const { setMode, setAccent } = slice.actions;
export default slice.reducer;
