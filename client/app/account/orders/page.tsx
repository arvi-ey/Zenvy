'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { getOrders, type Order } from '@/api/orders'
import { useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const statusLabels: Record<Order['status'], string> = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
}).format(Number(price))

export default function OrdersPage() {
  const router = useRouter()
  const authStatus = useAppSelector((state) => state.auth.status)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/sign-in?next=%2Faccount%2Forders')
    } else if (authStatus === 'authenticated') {
      void getOrders().then(setOrders).catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Unable to load your orders.')
      }).finally(() => setIsLoading(false))
    }
  }, [authStatus, router])

  if (authStatus === 'checking' || isLoading) {
    return <main className="mx-auto max-w-4xl space-y-4 px-4 py-12"><Skeleton className="h-8 w-40" /><Skeleton className="h-40 w-full rounded-xl" /></main>
  }
  if (authStatus !== 'authenticated') return null

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12">
      <Link href="/account" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to account
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <Package className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your delivery and review ordered products.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <section className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-medium">You have no orders yet.</p>
          <Button asChild className="mt-5"><Link href="/collections/all">Start shopping</Link></Button>
        </section>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <section key={order.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Truck className="h-4 w-4" /> {statusLabels[order.status]}
                </div>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between gap-4 py-4 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-muted-foreground">{item.selectedSize.toUpperCase()} / {item.selectedColor} · Qty {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">COD total (includes ₹40 delivery)</span>
                <span className="font-semibold">{formatPrice(order.total)}</span>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
