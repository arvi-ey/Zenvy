'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  // Show only 4 images as per requirements
  const displayImages = images.slice(0, 4)

  return (
    <div className="flex flex-col gap-4 sm:flex-row-reverse sm:gap-4 lg:gap-5">
      {/* Main Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted sm:flex-1">
        {displayImages.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`${productName} - View ${index + 1}`}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              index === selectedIndex ? 'opacity-100' : 'opacity-0'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
            priority={index === 0}
          />
        ))}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 sm:flex-col sm:w-20 lg:w-24">
        {displayImages.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'relative aspect-[3/4] w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted transition-all duration-200 sm:w-full',
              index === selectedIndex
                ? 'ring-2 ring-primary ring-offset-2'
                : 'opacity-60 hover:opacity-100'
            )}
            aria-label={`View image ${index + 1}`}
            aria-current={index === selectedIndex}
          >
            <Image
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
