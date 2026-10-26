'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, UserRound } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountPage() {
  const router = useRouter()
  const { status, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in?next=%2Faccount')
    }
  }, [router, status])

  if (status === 'checking') {
    return (
      <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-8 h-36 w-full rounded-xl" />
      </main>
    )
  }
  if (status !== 'authenticated' || !user) return null

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12">
      <div className="flex items-center gap-3">
        <UserRound className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">My account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome, {user.firstName}.</p>
        </div>
      </div>
      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="font-medium">Address book</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add and manage your delivery addresses.</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/account/addresses">Manage addresses <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
