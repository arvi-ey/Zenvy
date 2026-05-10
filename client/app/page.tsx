import { Header } from '@/components/client/Header'
import { Footer } from '@/components/server/Footer'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import CompactHero from '@/components/server/CompactHero'
import { CategoryGrid } from '@/components/server/CategoryGrid'
import { ProductSection } from '@/components/server/ProductSection'
import { BrandStory } from '@/components/server/BrandStory'
import {
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  products
} from '@/data/products'

export default function HomePage() {
  const featuredProducts = getFeaturedProducts()
  const newArrivals = getNewArrivals()
  const bestSellers = getBestSellers()
  const trendingProducts = products.slice(0, 8)

  return (
    <>


      <main className="min-h-screen">

        <CompactHero />


        <CategoryGrid />

        {/* Featured Products Grid */}
        <ProductSection
          title="Featured Products"
          products={featuredProducts}
          viewAllHref="/collections/all"
          priority
        />

        {/* Trending Products */}
        <ProductSection
          title="Trending Now"
          products={trendingProducts}
          viewAllHref="/collections/trending"
        />

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <ProductSection
            title="New Arrivals"
            products={newArrivals}
            viewAllHref="/collections/new-arrivals"
          />
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <ProductSection
            title="Best Sellers"
            products={bestSellers}
            viewAllHref="/collections/bestsellers"
          />
        )}

        {/* Brand Story Section */}
        <BrandStory />

        {/* All Products Preview */}
        <ProductSection
          title="Shop All"
          products={products.slice(0, 8)}
          viewAllHref="/collections/all"
        />
      </main>
    </>
  )
}
