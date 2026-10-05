'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/store/slices/productSlicer'
import useProducts from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 12

export default function ProductsPage() {
  const { getProducts, productsLoading } = useProducts()
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      const result = await getProducts({
        limit: PAGE_SIZE,
        page,
        orderBy: 'DESC',
      })

      if (cancelled) return

      if (result === null) {
        setHasMore(false)
        return
      }

      setProducts((current) => page === 1 ? result : [...current, ...result])
      setHasMore(result.length === PAGE_SIZE)
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [getProducts, page])

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Zenvy collection
        </p>
        <h1 className="mt-2 text-3xl font-semibold">All Products</h1>
        {!productsLoading && products.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} products
          </p>
        )}
      </div>

      {productsLoading && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-[3/4] rounded-lg bg-muted" />
              <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-4 w-1/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <h2 className="text-xl font-medium">No products available</h2>
          <p className="mt-2 text-muted-foreground">
            Please check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => {
              const image = product.images.find((item) => item.is_main) ?? product.images[0]

              return (
                <Link
                  key={product.id}
                  href={`/${product.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                    {image && (
                      <Image
                        src={image.url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h2 className="mt-3 line-clamp-1 text-sm font-medium group-hover:text-primary">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </p>
                </Link>
              )
            })}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => setPage((current) => current + 1)}
                disabled={productsLoading}
              >
                {productsLoading ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
