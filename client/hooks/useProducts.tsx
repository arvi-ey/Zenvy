import React, { useState } from 'react'
import api from '@/api/api'
export interface GetProductParams {
    category?: string,
    page?: number,
    limit?: number,
    orderBy?: string,
    is_featured?: boolean
}
function useProducts() {
    const [productsLoading, setProductsLoading] = useState<boolean>(true)


    const getProducts = async (params?: GetProductParams) => {
        setProductsLoading(true)
        try {
            const res = await api.get(`product/get-products`, { params })
            if (res.data.success) {
                return res.data.data
            }
            return null
        }
        catch {
            return null
        }
        finally {
            setProductsLoading(false)
        }
    }

    const getProductDetails = async (slug: string) => {
        setProductsLoading(true)

        try {
            const res = await api.get(`product/get-product-details?slug=${slug}`)
            if (res.data.success) {
                return res.data.data
            }
            return null
        }
        catch (error) {
            return null
        }
        finally {
            setProductsLoading(false)

        }
    }

    return {
        getProducts,
        getProductDetails,
        productsLoading
    }
}

export default useProducts