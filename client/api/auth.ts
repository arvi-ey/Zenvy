import api from '@/api/api'
import type { AuthUser } from '@/store/slices/authSlice'

interface AuthResponse {
  success: boolean
  message: string
  data: { user: AuthUser }
}

export interface SignUpCredentials {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export async function signUp(credentials: SignUpCredentials) {
  const response = await api.post<AuthResponse>('/auth/sign-up', credentials)
  return response.data.data.user
}

export async function signIn(credentials: SignInCredentials) {
  const response = await api.post<AuthResponse>('/auth/sign-in', credentials)
  return response.data.data.user
}

export async function getCurrentUser() {
  const response = await api.get<AuthResponse>('/auth/me')
  return response.data.data.user
}

export async function signOut() {
  await api.post('/auth/sign-out')
}
