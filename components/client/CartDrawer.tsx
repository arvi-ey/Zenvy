'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCartOpen } from '@/store/slices/uiSlice'
import { 
  selectCartItems, 
  selectCartTotal, 
  removeFromCart, 
  updateQuantity 
} from '@/store/slices/cartSlice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.isCartOpen)
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => dispatch(setCartOpen(false))}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-background shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <h2 className="text-lg font-semibold">Shopping Bag ({items.length})</h2>
            <button
              onClick={() => dispatch(setCartOpen(false))}
              className="rounded-full p-1 transition-colors hover:bg-muted"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Your bag is empty</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Looks like you haven&apos;t added anything to your bag yet.
                </p>
                <Button
                  onClick={() => dispatch(setCartOpen(false))}
                  className="mt-6"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.selectedSize.toUpperCase()} / {item.selectedColor}
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
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
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
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">
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
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <div className="mt-4 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/checkout" onClick={() => dispatch(setCartOpen(false))}>
                    Checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                  onClick={() => dispatch(setCartOpen(false))}
                >
                  <Link href="/cart">View Bag</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
