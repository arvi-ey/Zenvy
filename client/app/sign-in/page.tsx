'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { signIn } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/store/hooks'
import { setAuthenticated } from '@/store/slices/authSlice'

function getReturnPath() {
  const requestedPath = new URLSearchParams(window.location.search).get('next')
  return requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
    ? requestedPath
    : '/'
}

export default function SignInPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [returnQuery, setReturnQuery] = useState('')

  useEffect(() => {
    setReturnQuery(window.location.search)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)
    try {
      const session = await signIn({ email, password })
      dispatch(setAuthenticated(session))
      router.replace(getReturnPath())
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? 'Unable to sign in. Please try again.'
        : error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showGoogleDemo = () => {
    toast.info('Google sign-in will be available after OAuth is configured.')
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-background">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8 transition-all">
        {/* Enterprise Header Section */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground hover:opacity-95 transition-opacity">
            Zenvy<span className="text-primary">.</span>
          </Link>
          
        </div>

        <div className="mt-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to your account and checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-xl bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="h-11 rounded-xl bg-background/50"
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
              <p role="alert" className="text-xs font-medium text-destructive">{errorMessage}</p>
            </div>
          )}

          <Button type="submit" className="h-11 w-full rounded-xl font-medium shadow-sm transition-all" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          <span className="h-px flex-1 bg-border" />
          Or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button 
          type="button" 
          variant="outline" 
          className="h-11 w-full rounded-xl font-medium border-border/80 hover:bg-muted/60 transition-all" 
          onClick={showGoogleDemo}
        >
          <GoogleMark />
          Google Workspace
        </Button>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href={`/sign-up${returnQuery}`}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}