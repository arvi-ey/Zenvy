import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface ProductImage {
    url: string
    is_main: boolean
}

export interface Product {
    id: number
    name: string
    slug: string
    description: string
    category_id: number
    price: string
    status: "active" | "inactive" | "draft"
    created_at: string
    updated_at: string
    deleted_at: string | null
    stock: string
    images: ProductImage[]
}

interface ProductState {
    products: Product[]
}

const initialState: ProductState = {
    products: [],
}

const productSlice = createSlice({
    name: "product",

    initialState,

    reducers: {

        addProduct: (state, action: PayloadAction<Product>) => {
            state.products.push(action.payload)
        },

        // Update an existing product
        updateProduct: (
            state,
            action: PayloadAction<{
                id: number
                data: Partial<Product>
            }>
        ) => {
            const { id, data } = action.payload

            const product = state.products.find(
                (product) => product.id === id
            )

            if (product) {
                Object.assign(product, data)
            }
        },

        // Remove product from local state
        removeProduct: (
            state,
            action: PayloadAction<number>
        ) => {
            state.products = state.products.filter(
                (product) => product.id !== action.payload
            )
        },

        setProducts: (
            state,
            action: PayloadAction<Product[]>
        ) => {
            state.products = action.payload
        },

        appendProducts: (
            state,
            action: PayloadAction<Product[]>
        ) => {
            state.products.push(...action.payload)
        },
    },
})

export const {
    addProduct,
    updateProduct,
    removeProduct,
    setProducts,
    appendProducts
} = productSlice.actions

export default productSlice.reducer