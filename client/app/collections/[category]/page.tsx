import { notFound } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Footer } from '@/components/server/Footer'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import { FilterDrawer } from '@/components/client/FilterDrawer'
import { SortDropdown } from '@/components/client/SortDropdown'
import { ProductGrid } from '@/components/client/ProductGrid'
import {
  products,
  categories,
  getNewArrivals,
  getBestSellers
} from '@/data/products'

interface CollectionPageProps {
  params: Promise<{
    category: string
  }>
}

const specialCollections: Record<string, { title: string; description: string }> = {
  all: {
    title: 'All Products',
    description: 'Browse our complete collection of premium fashion essentials.',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'Discover the latest additions to our curated collection.',
  },
  bestsellers: {
    title: 'Best Sellers',
    description: 'Shop our most popular and loved pieces.',
  },
  trending: {
    title: 'Trending Now',
    description: 'Explore the styles everyone is wearing this season.',
  },
}

export async function generateStaticParams() {
  const categoryParams = categories.map((cat) => ({
    category: cat.slug,
  }))

  const specialParams = Object.keys(specialCollections).map((slug) => ({
    category: slug,
  }))

  return [...categoryParams, ...specialParams]
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { category } = await params

  const categoryData = categories.find((c) => c.slug === category)
  const specialData = specialCollections[category]

  if (!categoryData && !specialData) {
    return { title: 'Collection Not Found' }
  }

  const title = categoryData?.name || specialData?.title
  return {
    title: `${title} | LUXE`,
    description: categoryData
      ? `Shop ${categoryData.name} from our premium collection.`
      : specialData?.description,
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { category } = await params

  const categoryData = categories.find((c) => c.slug === category)
  const specialData = specialCollections[category]

  if (!categoryData && !specialData) {
    notFound()
  }

  // Get products based on collection type
  let collectionProducts = products

  if (categoryData) {
    collectionProducts = products.filter((p) => p.category === categoryData.id)
  } else if (category === 'new-arrivals') {
    collectionProducts = getNewArrivals()
  } else if (category === 'bestsellers') {
    collectionProducts = getBestSellers()
  }
  // For 'all' and 'trending', we show all products

  const title = categoryData?.name || specialData?.title
  const description = categoryData
    ? `Explore our collection of ${categoryData.productCount} premium ${categoryData.name.toLowerCase()}.`
    : specialData?.description

  return (
    <>

      <CartDrawer />
      <SearchModal />

      <main className="min-h-screen pb-12">
        {/* Page Header */}
        <div className="border-b border-border bg-secondary/30 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {/* Filters and Products */}
        <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <FilterDrawer />
            </div>
            <p className="text-sm text-muted-foreground">
              {collectionProducts.length} product{collectionProducts.length !== 1 && 's'}
            </p>
            <SortDropdown />
          </div>

          {/* Content */}
          <div className="flex gap-8">
            {/* Filter Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <FilterDrawer />
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <ProductGrid products={collectionProducts} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
