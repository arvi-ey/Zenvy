'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { cancelOrder, getOrder, type Order } from '@/api/orders'
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

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const authStatus = useAppSelector((state) => state.auth.status)
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const orderId = Number(params.id)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace(`/sign-in?next=${encodeURIComponent(`/account/orders/${params.id}`)}`)
      return
    }
    if (authStatus !== 'authenticated') return
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      toast.error('Invalid order.')
      setIsLoading(false)
      return
    }

    let active = true
    void getOrder(orderId)
      .then((result) => {
        if (active) setOrder(result)
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : 'Unable to load this order.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [authStatus, orderId, params.id, router])

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) return
    setIsCancelling(true)
    try {
      setOrder(await cancelOrder(order.id))
      toast.success('Your order has been cancelled.')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unable to cancel this order.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (authStatus === 'checking' || isLoading) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    )
  }
  if (authStatus !== 'authenticated') return null
  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Button asChild variant="outline">
          <Link href="/account/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to orders</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-12">
      <Link href="/account/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>
      <div className="mt-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Truck className="h-4 w-4" /> {statusLabels[order.status]}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-3 divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id ?? `${item.variantId}-${item.selectedSize}`} className="flex justify-between gap-4 py-4 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {item.selectedSize.toUpperCase()} / {item.selectedColor} · Qty {item.quantity}
                  </p>
                  <p className="mt-1 text-muted-foreground">{formatPrice(item.unitPrice)} each</p>
                </div>
                <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="h-fit space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Delivery address</h2>
            {order.address && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {order.address.street}
                {order.address.landmark && <> · {order.address.landmark}</>}
                <br />
                {order.address.district}, {order.address.state} {order.address.pincode}
              </p>
            )}
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Payment summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatPrice(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Total · Cash on Delivery</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {order.status === 'placed' && (
        <Button
          variant="outline"
          className="mt-6"
          disabled={isCancelling}
          onClick={() => void handleCancelOrder()}
        >
          {isCancelling ? 'Cancelling…' : 'Cancel order'}
        </Button>
      )}
    </main>
  )
}
