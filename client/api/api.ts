import axios, { type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store'
import { setUnauthenticated, type AuthUser } from '@/store/slices/authSlice'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

type RetryConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean
  _authUser?: AuthUser | null
}

let refreshPromise: Promise<void> | null = null
let csrfPromise: Promise<void> | null = null
let csrfToken: string | null = null

async function ensureCsrfToken(): Promise<void> {
  if (csrfToken) return
  csrfPromise ??= api
    .get<{ data?: { csrfToken?: string } }>('/auth/csrf')
    .then(({ data }) => {
      if (!data.data?.csrfToken) {
        throw new Error('The server did not provide a CSRF token.')
      }
      csrfToken = data.data.csrfToken
    })
    .finally(() => {
      csrfPromise = null
    })
  await csrfPromise
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (!['get', 'head', 'options'].includes(method) && !config.url?.endsWith('/auth/csrf')) {
    await ensureCsrfToken()
    if (csrfToken) config.headers.set('x-csrf-token', csrfToken)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const config = error.config as RetryConfig | undefined
    const url = config?.url ?? ''
    if (!config) return Promise.reject(error)

    if (config._authRetry) {
      if (store.getState().auth.user === config._authUser) {
        store.dispatch(setUnauthenticated())
      }
      return Promise.reject(error)
    }

    const isCurrentUserRequest = /\/auth\/me(?:[?#]|$)/.test(url)
    if (url.includes('/auth/') && !isCurrentUserRequest) {
      return Promise.reject(error)
    }

    if (store.getState().auth.status === 'unauthenticated') {
      return Promise.reject(error)
    }

    config._authRetry = true
    config._authUser = store.getState().auth.user
    try {
      refreshPromise ??= api.post('/auth/refresh').then(() => undefined).finally(() => {
        refreshPromise = null
      })
      await refreshPromise
      return api.request(config)
    } catch (refreshError) {
      if (store.getState().auth.user === config._authUser) {
        store.dispatch(setUnauthenticated())
      }
      return Promise.reject(refreshError)
    }
  }
)

export default api
