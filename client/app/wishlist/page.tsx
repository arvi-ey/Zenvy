'use client'

import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { Header } from '@/components/client/Header'
import { Footer } from '@/components/server/Footer'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import { ProductCard } from '@/components/client/ProductCard'
import { useAppSelector } from '@/store/hooks'
import { selectWishlistItems } from '@/store/slices/wishlistSlice'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  const wishlistItems = useAppSelector(selectWishlistItems)

  return (
    <>

      <CartDrawer />
      <SearchModal />

      <main className="min-h-screen pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-10">
          <h1 className="text-2xl font-semibold sm:text-3xl">Wishlist</h1>
          <p className="mt-1 text-muted-foreground">
            {wishlistItems.length} item{wishlistItems.length !== 1 && 's'} saved
          </p>

          {wishlistItems.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center text-center">
              <Heart className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Save your favorite items by clicking the heart icon on any product.
              </p>
              <Button asChild className="mt-6">
                <Link href="/collections/all">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {wishlistItems.map((item) => (
                <ProductCard key={item.product.id} product={item.product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
