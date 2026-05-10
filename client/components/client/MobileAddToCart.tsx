'use client'

import { ShoppingBag } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { addToCart } from '@/store/slices/cartSlice'
import { setCartOpen } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

interface MobileAddToCartProps {
  product: Product
}

export function MobileAddToCart({ product }: MobileAddToCartProps) {
  const dispatch = useAppDispatch()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity: 1,
        selectedSize: product.sizes[0]?.value || 'm',
        selectedColor: product.colors[0]?.name || 'Black',
      })
    )
    dispatch(setCartOpen(true))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-4 lg:hidden">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.name}
          </p>
          <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
        </div>
        <Button onClick={handleAddToCart} size="lg" className="gap-2">
          <ShoppingBag className="h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
