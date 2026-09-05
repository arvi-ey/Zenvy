import React, { useState } from 'react'
import api from '@/api/api'
export interface GetProductParams {
    category?: string,
    page?: number,
    limit?: number,
    orderBy?: string,
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

    return {
        getProducts,
        productsLoading
    }
}

export default useProducts