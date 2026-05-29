import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  avatar: string | null;
  jobTitle: string;
}

const initial: ProfileState = {
  firstName: "Alexandra",
  lastName: "Hayes",
  email: "alex.hayes@northstar.io",
  phone: "555 0124 998",
  countryCode: "+1",
  avatar: null,
  jobTitle: "Chief Operating Officer",
};

const persisted = typeof window !== "undefined" ? localStorage.getItem("profile.state") : null;
const initialState: ProfileState = persisted ? { ...initial, ...JSON.parse(persisted) } : initial;

const slice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<ProfileState>>) {
      Object.assign(state, action.payload);
      if (typeof window !== "undefined") localStorage.setItem("profile.state", JSON.stringify(state));
    },
  },
});
export const { updateProfile } = slice.actions;
export default slice.reducer;
