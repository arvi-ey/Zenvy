import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/client/ProductCard'
import type { Product } from '@/types'

interface ProductSectionProps {
  title: string
  products: Product[]
  viewAllHref?: string
  viewAllLabel?: string
  columns?: 2 | 3 | 4
  priority?: boolean
}

export function ProductSection({
  title,
  products,
  viewAllHref,
  viewAllLabel = 'View All',
  columns = 4,
  priority = false,
}: ProductSectionProps) {
  const gridCols = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className={`mt-5 grid gap-4 sm:gap-5 lg:gap-6 ${gridCols[columns]}`}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={priority && index < 4}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
