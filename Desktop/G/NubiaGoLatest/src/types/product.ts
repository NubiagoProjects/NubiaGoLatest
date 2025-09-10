export interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  rating?: number
  reviewCount?: number
  inStock?: boolean
  sku?: string
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
  featured?: boolean
  attributes?: Record<string, string | number | boolean>
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  originalPrice?: number
  sku: string
  inStock: boolean
  attributes: Record<string, string>
  image?: string
}

export interface ProductFilterOptions {
  categories?: string[]
  priceRange?: [number, number]
  minRating?: number
  inStock?: boolean
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'bestselling'
  searchQuery?: string
  page?: number
  limit?: number
}

export interface ProductReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title?: string
  comment: string
  createdAt: Date
  updatedAt?: Date
  verifiedPurchase?: boolean
  likes?: number
  dislikes?: number
  images?: string[]
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: ProductCategory[]
  productCount?: number
  featured?: boolean
  order?: number
}
