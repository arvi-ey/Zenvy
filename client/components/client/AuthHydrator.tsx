"use client"

import { useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { getCurrentUser } from '@/api/auth'
import { store } from '@/store'
import { setAuthenticated, setUnauthenticated } from '@/store/slices/authSlice'

let authHydrationPromise: ReturnType<typeof getCurrentUser> | null = null

function AuthHydrator() {
  useEffect(() => {
    if (store.getState().auth.status !== 'checking') return

    let cancelled = false
    authHydrationPromise ??= getCurrentUser().finally(() => {
      authHydrationPromise = null
    })
    authHydrationPromise
      .then((user) => {
        if (!cancelled && store.getState().auth.status === 'checking') {
          store.dispatch(setAuthenticated(user))
        }
      })
      .catch((error: unknown) => {
        if (cancelled || store.getState().auth.status !== 'checking') return
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          store.dispatch(setUnauthenticated())
          return
        }
        store.dispatch(setUnauthenticated())
        toast.error(error instanceof Error ? error.message : 'Unable to restore your session.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}

export default AuthHydrator
