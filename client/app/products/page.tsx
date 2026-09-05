"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import Page from '../../.next/dev/types/routes';

const Product = () => {
    const searchParams = useSearchParams()
    const category = searchParams.get('category')
    console.log(category)
    return (
        <div>
            this is product Page
        </div>
    )
}

export default Product