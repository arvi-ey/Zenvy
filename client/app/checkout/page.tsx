'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronLeft,
  Check,
  Banknote,
  CreditCard,
  Landmark,
  QrCode,
  Wallet,
  Lock,
  ShieldCheck,
  Truck,
  RotateCcw,
  BadgeCheck,
  Sparkles,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { AddressManager } from '@/components/client/AddressManager'
import { selectCartItems, clearCart, removeFromCart } from '@/store/slices/cartSlice'
import {
  selectAddressPickerOpen,
  selectShippingAddress,
  setAddressPickerOpen,
  setShippingAddress,
} from '@/store/slices/checkoutSlice'
import { createCashOnDeliveryOrder } from '@/api/orders'
import { getSingleCheckoutItem } from '@/lib/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation'
type CheckoutPaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet'

const checkoutPaymentMethods = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives.',
    icon: Banknote,
    available: true,
  },
  {
    id: 'upi',
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm and more.',
    icon: QrCode,
    available: true,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay and more.',
    icon: CreditCard,
    available: true,
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    description: 'Pay securely through your bank.',
    icon: Landmark,
    available: true,
  },
  {
    id: 'wallet',
    label: 'Wallets & Other Options',
    description: 'Wallets and other online options are not available yet.',
    icon: Wallet,
    available: false,
  },
] as const

const cardNetworks = [
  { name: 'Visa', src: '/payments/visa.svg' },
  { name: 'Mastercard', src: '/payments/mastercard.svg' },
  { name: 'RuPay', src: '/payments/rupay.svg' },
  { name: 'Amex', src: '/payments/amex.svg' },
]
const upiApps = [
  { name: 'Google Pay', src: '/payments/gpay.svg' },
  { name: 'PhonePe', src: '/payments/phonepe.svg' },
  { name: 'Paytm', src: '/payments/paytm.svg' },
]
const upiMark = { name: 'UPI', src: '/payments/upi.svg' }

function PaymentMark({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      title={name}
      className="inline-flex h-8 min-w-14 items-center justify-center rounded-md border border-border bg-background px-2"
    >
      {failed ? (
        <span className="text-[11px] font-medium text-muted-foreground">{name}</span>
      ) : (
        <span className="relative h-4 w-10">
          <Image
            src={src}
            alt={name}
            fill
            sizes="40px"
            className="object-contain"
            onError={() => setFailed(true)}
          />
        </span>
      )}
    </span>
  )
}

function StepBadge({
  index,
  label,
  isComplete,
  isCurrent,
  onClick,
  isLast,
}: {
  index: number
  label: string
  isComplete: boolean
  isCurrent: boolean
  onClick: () => void
  isLast: boolean
}) {
  return (
    <li className="flex flex-1 items-center last:flex-none">
      <button
        type="button"
        onClick={onClick}
        disabled={!isComplete}
        aria-current={isCurrent ? 'step' : undefined}
        className={cn(
          'group flex items-center gap-2.5',
          isComplete && 'cursor-pointer'
        )}
      >
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
            isComplete && 'bg-primary text-primary-foreground shadow-sm',
            isCurrent &&
              'border-2 border-primary bg-primary/5 text-primary ring-4 ring-primary/10',
            !isComplete &&
              !isCurrent &&
              'border border-border bg-background text-muted-foreground'
          )}
        >
          {isComplete ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            index + 1
          )}
        </span>
        <span
          className={cn(
            'hidden text-sm font-medium transition-colors sm:inline',
            isCurrent || isComplete ? 'text-foreground' : 'text-muted-foreground',
            isComplete && 'group-hover:underline'
          )}
        >
          {label}
        </span>
      </button>
      {!isLast && (
        <span
          className={cn(
            'mx-3 h-px flex-1 transition-colors duration-300',
            isComplete ? 'bg-primary' : 'bg-border'
          )}
          aria-hidden="true"
        />
      )}
    </li>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.status)
  const authUser = useAppSelector((state) => state.auth.user)
  const cartItems = useAppSelector(selectCartItems)
  const productId = searchParams.get('productId')
  const selectedItem = getSingleCheckoutItem(
    cartItems,
    productId,
    searchParams.get('size'),
    searchParams.get('color')
  )
  const items = productId ? (selectedItem ? [selectedItem] : []) : cartItems
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )
  const [step, setStep] = useState<CheckoutStep>('information')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<CheckoutPaymentMethod>('cod')
  const [orderId, setOrderId] = useState<number | null>(null)
  const selectedAddress = useAppSelector(selectShippingAddress)
  const isAddressPickerOpen = useAppSelector(selectAddressPickerOpen)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      const checkoutPath = searchParams.size
        ? `/checkout?${searchParams.toString()}`
        : '/checkout'
      router.replace(`/sign-in?next=${encodeURIComponent(checkoutPath)}`)
    }
  }, [authStatus, router, searchParams])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)

  const shippingCost = 40
  const total = subtotal + shippingCost

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'information', label: 'Information' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  const handleOnlinePaymentSubmission = () => {
    if (!selectedAddress) {
      toast.error('Choose a delivery address before continuing.')
      dispatch(setAddressPickerOpen(true))
      return
    }

    if (
      items.length === 0 ||
      items.some(
        (item) =>
          typeof item.variantId !== 'number' ||
          !Number.isSafeInteger(item.variantId) ||
          item.variantId <= 0
      )
    ) {
      toast.error('Your selected cart items are unavailable. Please return to your cart.')
      return
    }

    console.log('[Checkout] Online payment submission (UI only)', {
      paymentMethod: selectedPaymentMethod,
      email: authUser?.email,
      items: items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        variantId: item.variantId,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      shippingAddress: selectedAddress,
      subtotal,
      shippingCost,
      total,
    })
  }

  if (authStatus !== 'authenticated') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </main>
    )
  }

  if (productId && !selectedItem) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">This item is no longer in your cart</h1>
        <p className="text-sm text-muted-foreground">
          Return to your shopping bag to choose an item to checkout.
        </p>
        <Button asChild>
          <Link href="/cart">Return to bag</Link>
        </Button>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'information') {
      if (!selectedAddress) {
        toast.error('Choose a delivery address before continuing.')
        dispatch(setAddressPickerOpen(true))
        return
      }
      setStep('shipping')
    } else if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      if (selectedPaymentMethod !== 'cod') {
        handleOnlinePaymentSubmission()
        return
      }
      if (!selectedAddress) {
        toast.error('Choose a delivery address before placing your order.')
        dispatch(setAddressPickerOpen(true))
        return
      }
      const variantIds = items
        .map((item) => item.variantId)
        .filter(
          (variantId): variantId is number =>
            typeof variantId === 'number' &&
            Number.isSafeInteger(variantId) &&
            variantId > 0
        )
      if (items.length === 0 || variantIds.length !== items.length) {
        toast.error('Your selected cart items are unavailable. Please return to your cart.')
        return
      }
      setIsPlacingOrder(true)
      try {
        const order = await createCashOnDeliveryOrder(
          selectedAddress.id,
          variantIds,
          items.map((item, index) => ({
            variant_id: variantIds[index],
            selected_color: item.selectedColor,
          }))
        )
        setOrderId(order.id)
        if (productId && selectedItem) {
          dispatch(
            removeFromCart({
              productId: selectedItem.product.id,
              selectedSize: selectedItem.selectedSize,
              selectedColor: selectedItem.selectedColor,
            })
          )
        } else {
          dispatch(clearCart())
        }
        setStep('confirmation')
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Unable to place your order.')
      } finally {
        setIsPlacingOrder(false)
      }
    }
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
            <Check className="h-7 w-7 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="mt-7 text-2xl font-semibold tracking-tight">Order confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you for your purchase. Your order{' '}
            <span className="font-medium text-foreground">#{orderId}</span> has been placed
            successfully.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Payment is due at delivery. You can follow this order from your Orders section.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/collections/all">Continue shopping</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/account/orders">View my orders</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[1fr_460px] lg:items-start lg:gap-0">
        {/* ---------------- Checkout Form ---------------- */}
        <div className="px-4 py-8 sm:px-6 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-none">
            {/* Brand + trust */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-semibold tracking-[0.2em] text-foreground"
              >
                LUXE
              </Link>
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground sm:flex">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Secure checkout
              </span>
            </div>

            {/* Progress */}
            <nav aria-label="Checkout progress" className="mt-10">
              <ol className="flex items-center">
                {steps.map((s, index) => (
                  <StepBadge
                    key={s.key}
                    index={index}
                    label={s.label}
                    isComplete={index < currentStepIndex}
                    isCurrent={index === currentStepIndex}
                    onClick={() => index < currentStepIndex && setStep(s.key)}
                    isLast={index === steps.length - 1}
                  />
                ))}
              </ol>
            </nav>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {/* ---- Information ---- */}
              {step === 'information' && (
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                  <div className="border-b border-border bg-secondary/20 px-6 py-4 sm:px-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Step 1 · Contact & Delivery
                    </h2>
                  </div>
                  <div className="space-y-8 p-6 sm:p-8">
                    <div>
                      <h3 className="text-base font-semibold">Contact information</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        We'll send order updates to this email.
                      </p>
                      <div className="mt-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="mt-1.5"
                          defaultValue={authUser?.email}
                          required
                        />
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <h3 className="text-base font-semibold">Shipping address</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Where should we deliver your order?
                      </p>
                      <div className="mt-4 grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                              id="firstName"
                              className="mt-1.5"
                              defaultValue={authUser?.firstName}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                              id="lastName"
                              className="mt-1.5"
                              defaultValue={authUser?.lastName}
                              required
                            />
                          </div>
                        </div>

                        {selectedAddress ? (
                          <div className="rounded-xl border border-border bg-secondary/20 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <BadgeCheck className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-medium">
                                    {selectedAddress.type === 'others'
                                      ? 'Other'
                                      : selectedAddress.type === 'home'
                                        ? 'Home'
                                        : 'Office'}{' '}
                                    address
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {selectedAddress.street}
                                    {selectedAddress.landmark && (
                                      <> · {selectedAddress.landmark}</>
                                    )}
                                    <br />
                                    {selectedAddress.district}, {selectedAddress.state}{' '}
                                    {selectedAddress.pincode}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => dispatch(setAddressPickerOpen(true))}
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-border p-5 text-center">
                            <p className="text-sm text-muted-foreground">
                              Choose a saved address or add a new delivery address.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-3"
                              onClick={() => dispatch(setAddressPickerOpen(true))}
                            >
                              Choose delivery address
                            </Button>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            className="mt-1.5"
                            defaultValue={authUser?.phone}
                            required
                          />
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Used only for delivery updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Shipping ---- */}
              {step === 'shipping' && (
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                  <div className="border-b border-border bg-secondary/20 px-6 py-4 sm:px-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Step 2 · Shipping Method
                    </h2>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-base font-semibold">Choose a delivery speed</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      All orders are tracked and insured in transit.
                    </p>
                    <div className="mt-4 space-y-3">
                      <label className="relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-primary bg-primary/5 p-4 ring-4 ring-primary/5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                            <Truck className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Standard delivery</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              Delivered in 4–6 business days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold tabular-nums">
                            {formatPrice(40)}
                          </p>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check
                              className="h-3 w-3 text-primary-foreground"
                              strokeWidth={3}
                            />
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-secondary/40 px-4 py-3">
                      <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Free 14-day returns on unworn items with tags attached.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Payment ---- */}
              {step === 'payment' && (
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                  <div className="flex items-center justify-between border-b border-border bg-secondary/20 px-6 py-4 sm:px-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Step 3 · Payment
                    </h2>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      256-bit SSL
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-base font-semibold">Select a payment method</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      All transactions are secure and encrypted.
                    </p>

                    <div
                      className="mt-4 space-y-3"
                      role="radiogroup"
                      aria-label="Payment method"
                    >
                      {checkoutPaymentMethods.map((method) => {
                        const Icon = method.icon
                        const isSelected = selectedPaymentMethod === method.id
                        const isUnavailable = method.available === false

                        return (
                          <label
                            key={method.id}
                            className={cn(
                              'flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60',
                              !isUnavailable &&
                                'cursor-pointer hover:border-primary/60 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
                              isSelected
                                ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                                : 'border-border bg-background'
                            )}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              disabled={isPlacingOrder || isUnavailable}
                              checked={isSelected}
                              onChange={() => setSelectedPaymentMethod(method.id)}
                              className="sr-only peer"
                            />
                            <span
                              className={cn(
                                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors',
                                isSelected
                                  ? 'border-primary/20 bg-primary/10 text-primary'
                                  : 'border-border bg-muted text-muted-foreground'
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold">
                                  {method.label}
                                </span>
                                {isUnavailable ? (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    Unavailable
                                  </span>
                                ) : isSelected ? (
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary">
                                    <Check
                                      className="h-2.5 w-2.5 text-primary-foreground"
                                      strokeWidth={3}
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-1 block text-sm text-muted-foreground">
                                {method.description}
                              </span>
                              {method.id === 'card' && (
                                <span className="mt-2.5 flex flex-wrap gap-1.5">
                                  {cardNetworks.map((network) => (
                                    <PaymentMark
                                      key={network.name}
                                      name={network.name}
                                      src={network.src}
                                    />
                                  ))}
                                </span>
                              )}
                              {method.id === 'upi' && (
                                <span className="mt-2.5 flex flex-wrap gap-1.5">
                                  {upiApps.map((app) => (
                                    <PaymentMark
                                      key={app.name}
                                      name={app.name}
                                      src={app.src}
                                    />
                                  ))}
                                </span>
                              )}
                            </span>
                          </label>
                        )
                      })}
                    </div>

                    
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                {step !== 'information' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 'shipping') setStep('information')
                      if (step === 'payment') setStep('shipping')
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
                {step === 'information' && (
                  <Link
                    href="/cart"
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Return to cart
                  </Link>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 shadow-sm sm:ml-auto sm:min-w-56"
                  disabled={isPlacingOrder}
                >
                  {step === 'information' && 'Continue to shipping'}
                  {step === 'shipping' && 'Continue to payment'}
                  {step === 'payment' &&
                    (isPlacingOrder
                      ? 'Placing order…'
                      : selectedPaymentMethod === 'cod'
                        ? 'Place order'
                        : 'Pay now')}
                </Button>
              </div>
            </form>
          </div>

          <AddressManager
            mode="picker"
            open={isAddressPickerOpen}
            onOpenChange={(open) => dispatch(setAddressPickerOpen(open))}
            selectedAddressId={selectedAddress?.id}
            onSelect={(address) => dispatch(setShippingAddress(address))}
          />
        </div>

        {/* ---------------- Order Summary ---------------- */}
        <aside className="border-t border-border bg-gradient-to-b from-secondary/40 to-secondary/10 px-4 py-8 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-10 lg:py-14">
          <div className="mx-auto max-w-lg lg:mx-0 lg:max-w-none">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Order summary</h2>
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {items.reduce((n, i) => n + i.quantity, 0)} item
                {items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'}
              </span>
            </div>

            {/* Items */}
            <ul className="mt-5 space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-4"
                >
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background ring-2 ring-background">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.selectedSize.toUpperCase()} / {item.selectedColor}
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-6 space-y-2.5 border-t border-border pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium tabular-nums">
                  {formatPrice(shippingCost)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-semibold tabular-nums">
                {formatPrice(total)}
              </span>
            </div>

            {/* Trust strip */}
            <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-border bg-background/60 p-3">
              {[
                { icon: ShieldCheck, label: 'Secure' },
                { icon: Truck, label: 'Tracked' },
                { icon: RotateCcw, label: '14-day returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment footer */}
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Payments are encrypted and processed securely.
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...cardNetworks, upiMark].map((method) => (
                  <PaymentMark
                    key={method.name}
                    name={method.name}
                    src={method.src}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto grid min-h-[60vh] max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}