"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import useProducts from "@/hooks/useProducts"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setProducts } from "@/store/slices/productSlicer"

export default function CollectionPage() {
  const dispatch = useAppDispatch()

  const { products } = useAppSelector((state) => state.product)

  const params = useParams()

  const { getProducts, productsLoading } = useProducts()

  const category = params.category as string

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts()

      if (data && data.length > 0) {
        dispatch(setProducts(data))
      }
    }

    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <nav className="mb-5 flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
            <Link
              href="/"
              className="transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Home
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-medium capitalize text-gray-900 dark:text-white">
              {category}
            </span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {category}
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {productsLoading
                  ? "Loading products..."
                  : `${products.length} product${products.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Loading Skeletons */}
          {productsLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:bg-gray-900"
              >
                <div className="aspect-[4/5] animate-pulse bg-gray-100 dark:bg-gray-800/60" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-4/5 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800/60" />
                  <div className="h-5 w-24 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800/60" />
                </div>
              </div>
            ))}

          {/* Product Cards */}
          {!productsLoading &&
            products.map((product) => {
              const mainImage =
                product.images.find((image) => image.is_main) ??
                product.images[0]

              return (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] dark:bg-gray-900 dark:hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-800/40">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={product.name}
                        width={500}
                        height={625}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}

                    {/* Subtle gradient overlay on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-gray-900 dark:text-white">
                      {product.name}
                    </h2>

                    <div className="mt-auto pt-4">
                      <span className="text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Empty State */}
        {!productsLoading && products.length === 0 && (
          <div className="flex min-h-[480px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800/60">
                <span className="text-3xl">📦</span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                No products found
              </h2>
              <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                There are no products available in this collection right now.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}