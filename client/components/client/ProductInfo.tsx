'use client'

import { useState } from 'react'
import { Star, Heart, Truck, RotateCcw, Shield, Minus, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addToCart } from '@/store/slices/cartSlice'
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice'
import { setCartOpen } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const dispatch = useAppDispatch()
  const isWishlisted = useAppSelector(selectIsInWishlist(product.id))
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.value || '')
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '')
  const [quantity, setQuantity] = useState(1)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        selectedSize,
        selectedColor,
      })
    )
    dispatch(setCartOpen(true))
  }

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        selectedSize,
        selectedColor,
      })
    )
    // In a real app, redirect to checkout
    dispatch(setCartOpen(true))
  }

  return (
    <div className="flex flex-col">
      {/* Badges */}
      {product.badge && (
        <div className="mb-3">
          <span
            className={cn(
              'inline-block rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider',
              product.badge === 'new' && 'bg-primary text-primary-foreground',
              product.badge === 'bestseller' && 'bg-accent text-accent-foreground',
              product.badge === 'sale' && 'bg-destructive text-destructive-foreground'
            )}
          >
            {product.badge === 'sale' ? `-${discount}% Off` : product.badge}
          </span>
        </div>
      )}

      {/* Title & Category */}
      <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
      <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{product.name}</h1>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < Math.floor(product.rating)
                  ? 'fill-accent text-accent'
                  : 'fill-muted text-muted'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {product.rating} ({product.reviewCount} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-sm font-medium text-destructive">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {/* Color Selector */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Color: {selectedColor}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={cn(
                'relative h-9 w-9 rounded-full border-2 transition-all',
                selectedColor === color.name
                  ? 'border-primary scale-110'
                  : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Select ${color.name}`}
              aria-pressed={selectedColor === color.name}
            >
              {color.value === '#ffffff' && (
                <span className="absolute inset-0 rounded-full border border-border" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Size</span>
          <button className="text-sm text-muted-foreground underline hover:text-foreground">
            Size Guide
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size.value}
              onClick={() => size.inStock && setSelectedSize(size.value)}
              disabled={!size.inStock}
              className={cn(
                'flex h-10 min-w-[2.75rem] items-center justify-center rounded-md border px-3 text-sm font-medium transition-all',
                selectedSize === size.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : size.inStock
                  ? 'border-border hover:border-primary'
                  : 'cursor-not-allowed border-border opacity-40 line-through'
              )}
              aria-label={`Select size ${size.label}`}
              aria-pressed={selectedSize === size.value}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-6">
        <span className="text-sm font-medium">Quantity</span>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleAddToCart} className="flex-1" size="lg">
          Add to Cart
        </Button>
        <Button onClick={handleBuyNow} variant="secondary" className="flex-1" size="lg">
          Buy Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => dispatch(toggleWishlist(product))}
          className="sm:w-auto"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-5 w-5',
              isWishlisted ? 'fill-destructive text-destructive' : ''
            )}
          />
        </Button>
      </div>

      {/* Shipping Info */}
      <div className="mt-8 space-y-3 border-t border-border pt-6">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <span>Free shipping on orders over $150</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
          <span>Free 30-day returns</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <span>2-year quality guarantee</span>
        </div>
      </div>
    </div>
  )
}
