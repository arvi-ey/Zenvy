'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { AddressManager } from '@/components/client/AddressManager'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/store/hooks'

export default function AccountAddressesPage() {
  const router = useRouter()
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in?next=%2Faccount%2Faddresses')
    }
  }, [router, status])

  if (status === 'checking') {
    return (
      <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12">
        <Skeleton className="mb-8 h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </main>
    )
  }
  if (status !== 'authenticated') return null

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12">
      <Link href="/account" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to account
      </Link>
      <AddressManager mode="page" />
    </main>
  )
}
