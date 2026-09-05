import React, { useState } from 'react'
import api from '@/api/api'

const BASE = 'product-category'
const useCategory = () => {

    const [loading, setLoading] = useState<boolean>(true)


    const getCategories = async () => {
        setLoading(true)
        try {
            const res = await api.get(`${BASE}/get-categories`)
            if (res.data && res.data.success) {
                return res.data.data
            }
            return null
        }
        catch (error) {
            return null

        }
        finally {
            setLoading(false)
        }

    }

    return {
        getCategories,
        loading
    }
}

export default useCategory