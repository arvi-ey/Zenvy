// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: ProductCategory
  sizes: Size[]
  colors: Color[]
  rating: number
  reviewCount: number
  badge?: 'new' | 'bestseller' | 'sale'
  inStock: boolean
  featured?: boolean
}

export type ProductCategory = 
  | 'tshirts' 
  | 'shirts' 
  | 'trousers' 
  | 'jackets' 
  | 'accessories'

export interface Size {
  value: string
  label: string
  inStock: boolean
}

export interface Color {
  name: string
  value: string
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

// Wishlist Types
export interface WishlistItem {
  product: Product
  addedAt: string
}

// Filter Types
export interface FilterState {
  categories: ProductCategory[]
  sizes: string[]
  priceRange: [number, number]
  sortBy: SortOption
  searchQuery: string
}

export type SortOption = 
  | 'featured' 
  | 'newest' 
  | 'price-asc' 
  | 'price-desc' 
  | 'rating'

// Checkout Types
export interface CheckoutState {
  step: 'cart' | 'address' | 'payment' | 'confirmation'
  shippingAddress: Address | null
  billingAddress: Address | null
  paymentMethod: PaymentMethod | null
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  street: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault?: boolean
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'applepay'
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
}

// UI Types
export interface UIState {
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isFilterDrawerOpen: boolean
  isQuickViewOpen: boolean
  quickViewProduct: Product | null
  isSearchOpen: boolean
}

// Review Types
export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpful: number
  verified: boolean
}

// Category Display
export interface CategoryDisplay {
  id: ProductCategory
  name: string
  slug: string
  image: string
  productCount: number
}
