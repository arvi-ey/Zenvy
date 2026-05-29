import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  pendingEmail: string | null; // used between signup/forgot and OTP
  flow: "signup" | "forgot" | null;
}

const persisted = typeof window !== "undefined" ? localStorage.getItem("auth.isAuthenticated") : null;

const initialState: AuthState = {
  isAuthenticated: persisted === "true",
  email: typeof window !== "undefined" ? localStorage.getItem("auth.email") : null,
  pendingEmail: null,
  flow: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ email: string }>) {
      state.isAuthenticated = true;
      state.email = action.payload.email;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth.isAuthenticated", "true");
        localStorage.setItem("auth.email", action.payload.email);
      }
    },
    signOut(state) {
      state.isAuthenticated = false;
      state.email = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth.isAuthenticated");
        localStorage.removeItem("auth.email");
      }
    },
    startVerification(state, action: PayloadAction<{ email: string; flow: "signup" | "forgot" }>) {
      state.pendingEmail = action.payload.email;
      state.flow = action.payload.flow;
    },
    clearFlow(state) {
      state.pendingEmail = null;
      state.flow = null;
    },
  },
});

export const { signIn, signOut, startVerification, clearFlow } = authSlice.actions;
export default authSlice.reducer;
