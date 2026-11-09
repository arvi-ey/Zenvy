import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActiveTab, Toast } from '../types/index.ts';

interface UiState {
  activeTab: ActiveTab;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  darkMode: boolean;
  toasts: Toast[];
  backendStatus: {
    tested: boolean;
    connected: boolean;
    message: string;
    latency?: number;
  };
}

const initialState: UiState = {
  activeTab: 'overview',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  darkMode: false,
  toasts: [],
  backendStatus: {
    tested: false,
    connected: false,
    message: 'Backend server not yet tested. Ready for Express.js connection.',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload;
      state.mobileSidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    addToast: (state, action: PayloadAction<{ type: Toast['type']; title?: string; message: string }>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      state.toasts.push({
        id,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setBackendStatus: (state, action: PayloadAction<{ connected: boolean; message: string; latency?: number }>) => {
      state.backendStatus = {
        tested: true,
        connected: action.payload.connected,
        message: action.payload.message,
        latency: action.payload.latency,
      };
    },
  },
});

export const {
  setActiveTab,
  toggleSidebar,
  setMobileSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addToast,
  removeToast,
  setBackendStatus,
} = uiSlice.actions;

export default uiSlice.reducer;
