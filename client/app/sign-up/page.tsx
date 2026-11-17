'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { signUp } from '@/api/auth'
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

export default function SignUpPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [returnQuery, setReturnQuery] = useState('')

  useEffect(() => {
    setReturnQuery(window.location.search)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (form.password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await signUp(form)
      if (response.success) {
        setSuccessMessage(response.message)
      } else {
        setErrorMessage(response.message)
      }
    } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
        console.log("STATUS:", error.response?.status);
        console.log("RESPONSE:", error.response?.data);

        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to create your account. Please try again.";

        setErrorMessage(message);
    } else {
        setErrorMessage(
            error instanceof Error
                ? error.message
                : "Something went wrong."
        );
    }
}finally {
      setIsSubmitting(false)
    }
  }

  const showGoogleDemo = () => {
    toast.info('Google sign-up will be available after OAuth is configured.')
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-2xl font-bold tracking-wider">Zenvy</Link>
        <h1 className="mt-8 text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign up to save your details and continue to checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                autoComplete="given-name"
                value={form.first_name}
                onChange={(event) => setForm({ ...form, first_name: event.target.value })}
                minLength={2}
                maxLength={50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                autoComplete="family-name"
                value={form.last_name}
                onChange={(event) => setForm({ ...form, last_name: event.target.value })}
                minLength={2}
                maxLength={50}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              minLength={10}
              maxLength={15}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => {
                  setForm({ ...form, password: event.target.value })
                  setErrorMessage('')
                }}
                minLength={8}
                maxLength={72}
                className="pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isPasswordVisible}
              >
                {isPasswordVisible
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              At least 8 characters, including an uppercase letter and a number.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setErrorMessage('')
                }}
                minLength={8}
                maxLength={72}
                className="pr-10"
                aria-invalid={Boolean(confirmPassword && form.password !== confirmPassword)}
                aria-describedby={confirmPassword && form.password !== confirmPassword ? 'confirmPasswordError' : undefined}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                aria-label={isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}
                aria-pressed={isConfirmPasswordVisible}
              >
                {isConfirmPasswordVisible
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {confirmPassword && form.password !== confirmPassword && (
              <p id="confirmPasswordError" className="text-sm text-destructive">
                Passwords do not match.
              </p>
            )}
          </div>
          {successMessage && (
            <p role="status" aria-live="polite" className="text-sm text-emerald-600 dark:text-emerald-400">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">{errorMessage}</p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={showGoogleDemo}>
          <span aria-hidden="true" className="mr-2 font-bold text-base text-[#4285F4]">G</span>
          Sign up with Google
        </Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={`/sign-in${returnQuery}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
