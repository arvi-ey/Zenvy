'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleWishlist, selectIsInWishlist } from '@/store/slices/wishlistSlice'
import { addToCart } from '@/store/slices/cartSlice'
import { setCartOpen } from '@/store/slices/uiSlice'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const dispatch = useAppDispatch()
  const isWishlisted = useAppSelector(selectIsInWishlist(product.id))
  const [imageIndex, setImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(product))
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <article className="group relative">
      <Link
        href={`/product/${product.slug}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setImageIndex(0)
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {/* Main Image */}
          <Image
            src={product.images[imageIndex]}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-all duration-500',
              isHovered && 'scale-105'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />

          {/* Image Swap Indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {product.images.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setImageIndex(idx)}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    idx === imageIndex ? 'bg-foreground' : 'bg-foreground/40'
                  )}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            {product.badge === 'new' && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                New
              </span>
            )}
            {product.badge === 'bestseller' && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">
                Bestseller
              </span>
            )}
            {product.badge === 'sale' && (
              <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive-foreground">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-all duration-200',
              'opacity-0 group-hover:opacity-100',
              'hover:bg-background hover:scale-110',
              'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground'
              )}
            />
          </button>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className={cn(
              'absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-lg bg-background/95 py-2.5 text-sm font-medium backdrop-blur-sm transition-all duration-200',
              'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0',
              'hover:bg-primary hover:text-primary-foreground',
              'focus:opacity-100 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        </div>

        {/* Product Info */}
        <div className="mt-3">
          <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">
            {product.category}
          </p>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors.length > 1 && (
            <div className="mt-2 flex items-center gap-1.5">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
