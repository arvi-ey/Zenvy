'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Header } from '@/components/client/Header'
import { Footer } from '@/components/server/Footer'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectCartItems,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
} from '@/store/slices/cartSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartTotal)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const shipping = subtotal > 150 ? 0 : 15
  const total = subtotal + shipping

  return (
    <>

      <CartDrawer />
      <SearchModal />

      <main className="min-h-screen pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-10">
          <h1 className="text-2xl font-semibold sm:text-3xl">Shopping Bag</h1>

          {items.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Your bag is empty</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Looks like you haven&apos;t added anything to your bag yet. Start
                shopping to fill it up!
              </p>
              <Button asChild className="mt-6">
                <Link href="/collections/all">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-8">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-4 rounded-lg border border-border p-4"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-32 sm:w-28"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="font-medium transition-colors hover:text-primary"
                            >
                              {item.product.name}
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Size: {item.selectedSize.toUpperCase()} | Color:{' '}
                              {item.selectedColor}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  productId: item.product.id,
                                  selectedSize: item.selectedSize,
                                  selectedColor: item.selectedColor,
                                })
                              )
                            }
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item.product.id,
                                    selectedSize: item.selectedSize,
                                    selectedColor: item.selectedColor,
                                    quantity: item.quantity - 1,
                                  })
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item.product.id,
                                    selectedSize: item.selectedSize,
                                    selectedColor: item.selectedColor,
                                    quantity: item.quantity + 1,
                                  })
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <p className="text-base font-semibold">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link
                    href="/collections/all"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    &larr; Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 lg:col-span-4 lg:mt-0">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold">Order Summary</h2>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add {formatPrice(150 - subtotal)} more for free shipping
                      </p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mt-6">
                    <label
                      htmlFor="promo"
                      className="text-sm font-medium"
                    >
                      Promo Code
                    </label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="promo"
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button asChild className="mt-6 w-full" size="lg">
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 text-center text-xs text-muted-foreground">
                    <p>Secure checkout powered by Stripe</p>
                    <p className="mt-1">30-day returns | Free shipping over $150</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
