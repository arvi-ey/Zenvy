import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
}

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  accessToken: string | null
}

const initialState: AuthState = {
  user: null,
  status: 'checking',
  accessToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken?: string } | AuthUser>
    ) => {
      const payload = action.payload
      state.user = 'user' in payload ? payload.user : payload
      if ('accessToken' in payload && payload.accessToken) {
        state.accessToken = payload.accessToken
      }
      state.status = 'authenticated'
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    setUnauthenticated: (state) => {
      state.user = null
      state.status = 'unauthenticated'
      state.accessToken = null
    },
  },
})

export const { setAuthenticated, setAccessToken, setUnauthenticated } = authSlice.actions
export default authSlice.reducer
