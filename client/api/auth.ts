import api from '@/api/api'
import type { AuthUser } from '@/store/slices/authSlice'

interface AuthResponse {
  success: boolean
  message: string
  data: { user: AuthUser }
}

interface SignUpResponse {
  success: boolean
  message: string
  data: { userId: number }
}

export interface VerificationResult {
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    phone: string
    user_type: 'admin' | 'user'
  }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface SignUpCredentials {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export async function signUp(credentials: SignUpCredentials) {
  const response = await api.post<SignUpResponse>('/auth/sign-up', credentials)
  return response.data
}

export async function signIn(credentials: SignInCredentials) {
  const response = await api.post<AuthResponse>('/auth/sign-in', credentials)
  return response.data.data.user
}

export async function verifyEmail(token: string) {
  const response = await api.post<ApiResponse<VerificationResult>>('/auth/verify-email', { token })
  return response.data.data
}

export async function resendVerificationEmail(email: string) {
  const response = await api.post<ApiResponse<undefined>>('/auth/resend-verification', { email })
  return response.data.message
}

export async function getCurrentUser() {
  const response = await api.get<ApiResponse<AuthUser>>('/auth/me')
  return response.data.data
}

export async function signOut() {
  await api.post('/auth/sign-out')
}
