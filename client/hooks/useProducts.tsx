import { useCallback, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import api from '@/api/api'
import type { Product } from '@/store/slices/productSlicer'

export interface GetProductParams {
    category?: string,
    page?: number,
    limit?: number,
    orderBy?: string,
    is_featured?: boolean
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

interface ProductDetail extends Product {
    is_featured: boolean
    stocks: { size: string; stock: number }[]
    category_name: string
}

function showRequestError(error: unknown) {
    const message = axios.isAxiosError<ApiResponse<unknown>>(error)
        ? error.response?.data?.message ?? error.message
        : error instanceof Error
            ? error.message
            : 'Unable to load products.'
    toast.error(message)
}

function useProducts() {
    const [productsLoading, setProductsLoading] = useState<boolean>(true)

    const getProducts = useCallback(async (params?: GetProductParams) => {
        setProductsLoading(true)
        try {
            const res = await api.get<ApiResponse<Product[]>>(`product/get-products`, { params })
            if (res.data.success) {
                return res.data.data
            }
            return null
        } catch (error: unknown) {
            showRequestError(error)
            return null
        }
        finally {
            setProductsLoading(false)
        }
    }, [])

    const getProductDetails = useCallback(async (slug: string) => {
        setProductsLoading(true)

        try {
            const res = await api.get<ApiResponse<ProductDetail>>(`product/get-product-details`, {
                params: { slug },
            })
            if (res.data.success) {
                return res.data.data
            }
            return null
        } catch (error: unknown) {
            showRequestError(error)
            return null
        }
        finally {
            setProductsLoading(false)

        }
    }, [])

    return {
        getProducts,
        getProductDetails,
        productsLoading
    }
}

export default useProducts