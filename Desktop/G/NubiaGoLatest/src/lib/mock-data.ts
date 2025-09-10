import { User, Product, Category, Cart, Order, Review, Wishlist, Address } from '@/types'

// ============================================================================
// MOCK DATA - Simplified to fix TypeScript build errors
// ============================================================================

export const mockUsers: User[] = [
  {
    id: 'user-1',
    uid: 'user-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'customer',
    isVerified: true,
    createdAt: new Date('2024-01-15')
  }
]

export const mockCategories: Category[] = []
export const mockProducts: Product[] = []
export const mockCarts: Cart[] = []
export const mockOrders: Order[] = []
export const mockReviews: Review[] = []
export const mockWishlists: Wishlist[] = []
export const mockAddresses: Address[] = []

// Helper functions for mock data
export const getMockUser = (uid: string): User | undefined => {
  return mockUsers.find(user => user.uid === uid)
}

export const getMockProduct = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id)
}

export const getMockProductsByCategory = (categoryId: string): Product[] => {
  return mockProducts.filter(product => product.category === categoryId)
}

export const getMockProductReviews = (productId: string): Review[] => {
  return mockReviews.filter(review => review.id === productId)
}
