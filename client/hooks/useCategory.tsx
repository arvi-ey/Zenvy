import React, { useState } from 'react'
import api from '@/api/api'

const BASE = 'product-category'
const useCategory = () => {

    const [loading, setLoading] = useState<boolean>(false)


    const getCategories = async () => {
        setLoading(false)
        try {
            const res = await api.get(`${BASE}/get-categories`)
            console.log(res)
            if (res.data && res.data.success) {
                console.log("HELLO")
                return res.data.data
            }
            return null
        }
        catch (error) {
            return null

        }
        finally {
            setLoading(true)
        }

    }

    return {
        getCategories,
        loading
    }
}

export default useCategory