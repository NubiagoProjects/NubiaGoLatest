import { Product } from './product'

export interface WishlistItem {
  productId: string
  product?: Product
  addedAt: Date
}

export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
  updatedAt: Date
}
