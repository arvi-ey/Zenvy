import Link from 'next/link'
import Image from 'next/image'
import { categories } from '@/data/products'
import { ArrowRight } from 'lucide-react'

export function CategoryGrid() {
  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-5xl">Shop by Category</h2>
          <Link
            href="/collections/all"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-sm sm:text-xl font-bold text-white dark:text-white">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-xs text-white/80">
                  {category.productCount} items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
