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
}

const initialState: AuthState = {
  user: null,
  status: 'checking',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.status = 'authenticated'
    },
    setUnauthenticated: (state) => {
      state.user = null
      state.status = 'unauthenticated'
    },
  },
})

export const { setAuthenticated, setUnauthenticated } = authSlice.actions
export default authSlice.reducer
