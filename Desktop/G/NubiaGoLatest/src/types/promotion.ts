export interface Promotion {
  id: string
  name: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_shipping'
  value: number // percentage (0-100) or fixed amount
  code?: string // promo code for manual application
  startDate: Date
  endDate: Date
  isActive: boolean
  usageLimit?: number
  usedCount: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  applicableProducts?: string[] // product IDs
  applicableCategories?: string[] // category IDs
  createdAt: Date
  updatedAt: Date
}

export interface Deal {
  id: string
  title: string
  description: string
  productId: string
  originalPrice: number
  salePrice: number
  discountPercentage: number
  badge: 'Hot' | 'Sale' | 'Limited' | 'New' | 'Featured'
  startDate: Date
  endDate: Date
  isActive: boolean
  featured: boolean
  priority: number // for sorting featured deals
  createdAt: Date
  updatedAt: Date
}

export interface PromotionApplication {
  promotionId: string
  productId: string
  originalPrice: number
  discountedPrice: number
  discountAmount: number
  discountPercentage: number
}

export interface PromotionStats {
  totalPromotions: number
  activePromotions: number
  totalSavings: number
  mostUsedPromotion: string
  conversionRate: number
}
