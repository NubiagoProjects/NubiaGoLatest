// Types - Centralized exports for better organization

// Core Types
export * from './common'

// API Types
export type { 
  ApiResponse, 
  ApiConfiguration, 
  ApiEndpoint,
  ApiProvider,
  ApiTestResult
} from './api'

// Common Types  
export type { 
  User, 
  UserPreferences, 
  Address 
} from './common'

// Product Types
export type { 
  Product, 
  ProductCategory, 
  ProductVariant, 
  ProductReview 
} from './product'

// Cart and Order Types
export type { 
  Cart, 
  CartItem, 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus 
} from './common'

// Export Category alias for backward compatibility
export type { ProductCategory as Category } from './common'

// Export Review alias for backward compatibility
export type { ProductReview as Review } from './product'

// Wishlist Types
export type { Wishlist, WishlistItem } from './wishlist'

// Promotion Types
export type { Promotion, Deal, PromotionApplication, PromotionStats } from './promotion'
