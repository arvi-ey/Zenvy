import { notFound } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Footer } from '@/components/server/Footer'
import { CartDrawer } from '@/components/client/CartDrawer'
import { SearchModal } from '@/components/client/SearchModal'
import { ProductGallery } from '@/components/client/ProductGallery'
import { ProductInfo } from '@/components/client/ProductInfo'
import { MobileAddToCart } from '@/components/client/MobileAddToCart'
import { ProductSection } from '@/components/server/ProductSection'
import { products, getProductBySlug, getRelatedProducts } from '@/data/products'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.name} | LUXE`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product.id, product.category)

  return (
    <>

      <CartDrawer />
      <SearchModal />

      <main className="min-h-screen pb-24 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/" className="transition-colors hover:text-foreground">
                  Home
                </a>
              </li>
              <li>/</li>
              <li>
                <a
                  href={`/collections/${product.category}`}
                  className="capitalize transition-colors hover:text-foreground"
                >
                  {product.category}
                </a>
              </li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          {/* Product Content */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Info */}
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductSection
            title="You May Also Like"
            products={relatedProducts}
            viewAllHref={`/collections/${product.category}`}
            viewAllLabel="View All"
          />
        )}

        {/* Mobile Sticky Add to Cart */}
        <MobileAddToCart product={product} />
      </main>

    </>
  )
}
