"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import useProducts from "@/hooks/useProducts"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setProducts, appendProducts } from "@/store/slices/productSlicer"
import { ArrowRight } from "lucide-react"


interface hoveredItem {
  entered: boolean,
  item: number | null
}

export default function ProductSection() {
  const dispatch = useAppDispatch()

  const { products } = useAppSelector(
    (state) => state.product
  )



  const { getProducts, productsLoading } = useProducts()
  const [count, setCount] = useState(1)
  const [mouseentered, setMouseEntered] = useState<hoveredItem>()
  const [noproduct, setNoproduct] = useState<boolean>(false)



  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      const data = await getProducts({

        orderBy: 'ASC',
        page: count,
        is_featured: true,
        limit: 10
      })

      if (cancelled) return   // <-- ignore stale responses

      if (data && data.length > 0) {
        if (count === 1) dispatch(setProducts(data))
        else dispatch(appendProducts(data))
      } else {
        setNoproduct(true)
      }
    }

    fetchProducts()

    return () => { cancelled = true }   // <-- cleanup
  }, [count, dispatch])       // note: do NOT add getProducts




  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl">


        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-extrabold text-2xl">FEATURED PRODUCTS</p>
          <Link
            href="/collections/featured"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View All Featured Products
            <ArrowRight className="h-4 w-4" />
          </Link>

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
                  onMouseEnter={() => setMouseEntered({ entered: true, item: product.id })}
                  onMouseLeave={() => setMouseEntered({ entered: false, item: null })}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                >

                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {mainImage ? (
                      <Image
                        src={mouseentered?.entered && mouseentered.item == product.id ? product.images[1].url : product.images[0].url}
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


      </div>
    </section>
  )
}