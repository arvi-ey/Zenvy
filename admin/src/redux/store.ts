// Redux store wiring all feature slices.
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import ordersReducer from "./slices/ordersSlice";
import usersReducer from "./slices/usersSlice";
import itemsReducer from "./slices/itemsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import notificationsReducer from "./slices/notificationsSlice";
import settingsReducer from "./slices/settingsSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    orders: ordersReducer,
    users: usersReducer,
    items: itemsReducer,
    categories: categoriesReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
