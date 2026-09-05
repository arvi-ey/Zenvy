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

  const { products } = useAppSelector(
    (state) => state.product
  )

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
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">


        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>

            <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/"
                className="transition hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </Link>

              <span>/</span>

              <span className="capitalize text-gray-900 dark:text-white">
                {category}
              </span>
            </div>

            {!productsLoading && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {products.length} products
              </p>
            )}
          </div>


        </div>


        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">


          {productsLoading &&
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >

                <div className="aspect-[4/5] animate-pulse bg-gray-200 dark:bg-gray-800" />


                <div className="space-y-4 p-5">


                  <div className="flex items-center justify-between">
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                    <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                  </div>


                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />


                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            ))}


          {!productsLoading &&
            products.map((product) => {
              const mainImage =
                product.images.find(
                  (image) => image.is_main
                ) ?? product.images[0]

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                >

                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={product.name}
                        width={500}
                        height={625}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>


                  <div className="p-5">


                    <div className="mb-2 flex items-center justify-between">


                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : product.status === "inactive"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                      >
                        {product.status}
                      </span>
                    </div>


                    <h2 className="line-clamp-1 text-base font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h2>


                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{product.price}
                      </span>

                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>


        {!productsLoading && products.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <span className="text-2xl">📦</span>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                No products found
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                There are no products available in this collection.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}