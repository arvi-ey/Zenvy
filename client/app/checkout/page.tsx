'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, Lock, Check } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { AddressManager } from '@/components/client/AddressManager'
import type { Address } from '@/api/address'
import { selectCartItems, clearCart, removeFromCart } from '@/store/slices/cartSlice'
import { deleteProductFromCart } from '@/api/cart'
import { getSingleCheckoutItem } from '@/lib/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation'

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
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      const checkoutPath = searchParams.size
        ? `/checkout?${searchParams.toString()}`
        : '/checkout'
      router.replace(`/sign-in?next=${encodeURIComponent(checkoutPath)}`)
    }
  }, [authStatus, router, searchParams])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const shippingCost = shippingMethod === 'express' ? 25 : subtotal > 150 ? 0 : 15
  const total = subtotal + shippingCost

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'information', label: 'Information' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

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
        setIsAddressPickerOpen(true)
        return
      }
      setStep('shipping')
    } else if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      setIsPlacingOrder(true)
      try {
        if (productId && selectedItem) {
          await deleteProductFromCart(selectedItem.product.id)
          dispatch(removeFromCart({
            productId: selectedItem.product.id,
            selectedSize: selectedItem.selectedSize,
            selectedColor: selectedItem.selectedColor,
          }))
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
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your purchase. Your order #12345 has been placed successfully.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            You will receive an email confirmation shortly with tracking information.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/collections/all">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-2 lg:gap-0">
        {/* Checkout Form */}
        <div className="px-4 py-6 lg:px-8 lg:py-10">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wider">
            LUXE
          </Link>

          {/* Progress Steps */}
          <nav className="mt-6 flex items-center gap-2 text-sm">
            {steps.map((s, index) => (
              <span key={s.key} className="flex items-center gap-2">
                <button
                  onClick={() => index < currentStepIndex && setStep(s.key)}
                  className={cn(
                    'transition-colors',
                    index <= currentStepIndex
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                    index < currentStepIndex && 'hover:underline cursor-pointer'
                  )}
                  disabled={index >= currentStepIndex}
                >
                  {s.label}
                </button>
                {index < steps.length - 1 && (
                  <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                )}
              </span>
            ))}
          </nav>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Information Step */}
            {step === 'information' && (
              <>
                <div>
                  <h2 className="text-lg font-semibold">Contact Information</h2>
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

                <div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                  <div className="mt-4 grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" className="mt-1.5" defaultValue={authUser?.firstName} required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" className="mt-1.5" defaultValue={authUser?.lastName} required />
                      </div>
                    </div>
                    {selectedAddress ? (
                      <div className="rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              {selectedAddress.type === 'others'
                                ? 'Other'
                                : selectedAddress.type === 'home' ? 'Home' : 'Office'} address
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {selectedAddress.street}
                              {selectedAddress.landmark && <> · {selectedAddress.landmark}</>}
                              <br />
                              {selectedAddress.district}, {selectedAddress.state} {selectedAddress.pincode}
                            </p>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => setIsAddressPickerOpen(true)}>
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-4">
                        <p className="text-sm text-muted-foreground">Choose a saved address or add a new delivery address.</p>
                        <Button type="button" variant="outline" className="mt-3" onClick={() => setIsAddressPickerOpen(true)}>
                          Choose delivery address
                        </Button>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" className="mt-1.5" defaultValue={authUser?.phone} required />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Shipping Step */}
            {step === 'shipping' && (
              <div>
                <h2 className="text-lg font-semibold">Shipping Method</h2>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="mt-4 space-y-3"
                >
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors',
                      shippingMethod === 'standard'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="standard" />
                      <div>
                        <p className="font-medium">Standard Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          5-7 business days
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {subtotal > 150 ? 'Free' : formatPrice(15)}
                    </p>
                  </label>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors',
                      shippingMethod === 'express'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="express" />
                      <div>
                        <p className="font-medium">Express Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          2-3 business days
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(25)}</p>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <>
                <div>
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All transactions are secure and encrypted.
                  </p>
                  <div className="mt-4 rounded-lg border border-border p-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM / YY"
                            className="mt-1.5"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            className="mt-1.5"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" className="mt-1.5" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Billing Address</h2>
                  <label className="mt-4 flex items-center gap-2">
                    <Checkbox
                      checked={sameAsBilling}
                      onCheckedChange={(checked) =>
                        setSameAsBilling(checked as boolean)
                      }
                    />
                    <span className="text-sm">Same as shipping address</span>
                  </label>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step !== 'information' && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'shipping') setStep('information')
                    if (step === 'payment') setStep('shipping')
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {step === 'information' && (
                <Link
                  href="/cart"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Return to cart
                </Link>
              )}
              <Button type="submit" size="lg" className="gap-2 sm:ml-auto" disabled={isPlacingOrder}>
                {step === 'payment' && <Lock className="h-4 w-4" />}
                {step === 'information' && 'Continue to Shipping'}
                {step === 'shipping' && 'Continue to Payment'}
                {step === 'payment' && (isPlacingOrder ? 'Placing Order…' : 'Place Order')}
              </Button>
            </div>
          </form>
          <AddressManager
            mode="picker"
            open={isAddressPickerOpen}
            onOpenChange={setIsAddressPickerOpen}
            selectedAddressId={selectedAddress?.id}
            onSelect={setSelectedAddress}
          />
        </div>

        {/* Order Summary Sidebar */}
        <div className="border-t border-border bg-secondary/30 px-4 py-6 lg:border-l lg:border-t-0 lg:px-8 lg:py-10">
          <h2 className="text-lg font-semibold lg:sr-only">Order Summary</h2>

          {/* Cart Items */}
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                className="flex gap-4"
              >
                <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground text-[10px] font-medium text-background">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.selectedSize.toUpperCase()} / {item.selectedColor}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="mt-6 space-y-3 border-t border-border pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
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
