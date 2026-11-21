"use client"

import { useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { getCurrentUser } from '@/api/auth'
import { store } from '@/store'
import { setAuthenticated, setUnauthenticated } from '@/store/slices/authSlice'

function AuthHydrator() {
  useEffect(() => {
    // Skip if authentication is already checked
    if (store.getState().auth.status !== 'checking') return

    let cancelled = false

    const hydrateAuth = async () => {
      try {
        // Get the currently logged-in user
        const user = await getCurrentUser()
        console.log('Current User:', user)

        if (!cancelled && store.getState().auth.status === 'checking') {
          store.dispatch(setAuthenticated(user))
        }
      } catch (error) {
        if (cancelled || store.getState().auth.status !== 'checking') return

        store.dispatch(setUnauthenticated())

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return
        }

        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to restore your session.'
        )
      }
    }

    hydrateAuth()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}

export default AuthHydrator