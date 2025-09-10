import { Promotion, Deal, PromotionApplication, PromotionStats } from '@/types'
import { Product } from '@/types'

// Mock promotions data
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Summer Sale',
    description: '25% off all summer items',
    type: 'percentage',
    value: 25,
    code: 'SUMMER25',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    isActive: true,
    usageLimit: 1000,
    usedCount: 245,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    applicableCategories: ['fashion', 'accessories'],
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-06-01')
  },
  {
    id: 'promo-2',
    name: 'Electronics Deal',
    description: '$50 off electronics over $200',
    type: 'fixed_amount',
    value: 50,
    code: 'TECH50',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    usageLimit: 500,
    usedCount: 89,
    minOrderAmount: 200,
    applicableCategories: ['electronics'],
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-07-01')
  }
]

// Mock deals data
const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Flash Sale - Premium Headphones',
    description: 'Limited time offer on premium wireless headphones',
    productId: 'prod-1',
    originalPrice: 299.99,
    salePrice: 199.99,
    discountPercentage: 33,
    badge: 'Hot',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    isActive: true,
    featured: true,
    priority: 1,
    createdAt: new Date('2024-06-25'),
    updatedAt: new Date('2024-07-01')
  },
  {
    id: 'deal-2',
    title: 'Weekend Special - Smart Watch',
    description: 'Get the latest smartwatch at an unbeatable price',
    productId: 'prod-2',
    originalPrice: 399.99,
    salePrice: 299.99,
    discountPercentage: 25,
    badge: 'Sale',
    startDate: new Date('2024-07-05'),
    endDate: new Date('2024-07-07'),
    isActive: true,
    featured: true,
    priority: 2,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-05')
  },
  {
    id: 'deal-3',
    title: 'New Arrival - Designer Jacket',
    description: 'Fresh from the runway, limited quantities available',
    productId: 'prod-3',
    originalPrice: 199.99,
    salePrice: 149.99,
    discountPercentage: 25,
    badge: 'New',
    startDate: new Date('2024-07-10'),
    endDate: new Date('2024-08-10'),
    isActive: true,
    featured: true,
    priority: 3,
    createdAt: new Date('2024-07-08'),
    updatedAt: new Date('2024-07-10')
  },
  {
    id: 'deal-4',
    title: 'Limited Edition Sneakers',
    description: 'Exclusive colorway, only 100 pairs available',
    productId: 'prod-4',
    originalPrice: 179.99,
    salePrice: 139.99,
    discountPercentage: 22,
    badge: 'Limited',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-30'),
    isActive: true,
    featured: true,
    priority: 4,
    createdAt: new Date('2024-07-12'),
    updatedAt: new Date('2024-07-15')
  },
  {
    id: 'deal-5',
    title: 'Beauty Bundle Deal',
    description: 'Complete skincare routine at 30% off',
    productId: 'prod-5',
    originalPrice: 129.99,
    salePrice: 89.99,
    discountPercentage: 31,
    badge: 'Featured',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-08-31'),
    isActive: true,
    featured: true,
    priority: 5,
    createdAt: new Date('2024-06-28'),
    updatedAt: new Date('2024-07-01')
  }
]

export class PromotionService {
  private static instance: PromotionService
  
  static getInstance(): PromotionService {
    if (!PromotionService.instance) {
      PromotionService.instance = new PromotionService()
    }
    return PromotionService.instance
  }

  // Get all active promotions
  async getActivePromotions(): Promise<Promotion[]> {
    console.log('Getting active promotions with mock data')
    const now = new Date()
    return MOCK_PROMOTIONS.filter(promo => 
      promo.isActive && 
      promo.startDate <= now && 
      promo.endDate >= now
    )
  }

  // Get promotion by code
  async getPromotionByCode(code: string): Promise<Promotion | null> {
    console.log('Getting promotion by code:', code)
    const now = new Date()
    const promotion = MOCK_PROMOTIONS.find(promo => 
      promo.code === code && 
      promo.isActive && 
      promo.startDate <= now && 
      promo.endDate >= now
    )
    return promotion || null
  }

  // Apply promotion to product
  async applyPromotionToProduct(product: Product, promotionId: string): Promise<PromotionApplication | null> {
    console.log('Applying promotion to product:', product.id, promotionId)
    const promotion = MOCK_PROMOTIONS.find(p => p.id === promotionId)
    
    if (!promotion || !promotion.isActive) {
      return null
    }

    const now = new Date()
    if (promotion.startDate > now || promotion.endDate < now) {
      return null
    }

    // Check if promotion applies to this product
    if (promotion.applicableProducts && !promotion.applicableProducts.includes(product.id)) {
      return null
    }

    if (promotion.applicableCategories && !promotion.applicableCategories.includes(product.category)) {
      return null
    }

    let discountAmount = 0
    let discountedPrice = product.price

    switch (promotion.type) {
      case 'percentage':
        discountAmount = (product.price * promotion.value) / 100
        if (promotion.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount)
        }
        discountedPrice = product.price - discountAmount
        break
      
      case 'fixed_amount':
        discountAmount = Math.min(promotion.value, product.price)
        discountedPrice = product.price - discountAmount
        break
      
      default:
        return null
    }

    const discountPercentage = (discountAmount / product.price) * 100

    return {
      promotionId: promotion.id,
      productId: product.id,
      originalPrice: product.price,
      discountedPrice,
      discountAmount,
      discountPercentage
    }
  }

  // Get all active deals
  async getActiveDeals(): Promise<Deal[]> {
    console.log('Getting active deals with mock data')
    const now = new Date()
    return MOCK_DEALS.filter(deal => 
      deal.isActive && 
      deal.startDate <= now && 
      deal.endDate >= now
    ).sort((a, b) => a.priority - b.priority)
  }

  // Get featured deals
  async getFeaturedDeals(limitCount: number = 5): Promise<Deal[]> {
    console.log('Getting featured deals with mock data')
    const activeDeals = await this.getActiveDeals()
    return activeDeals
      .filter(deal => deal.featured)
      .slice(0, limitCount)
  }

  // Get deal by product ID
  async getDealByProductId(productId: string): Promise<Deal | null> {
    console.log('Getting deal by product ID:', productId)
    const activeDeals = await this.getActiveDeals()
    return activeDeals.find(deal => deal.productId === productId) || null
  }

  // Calculate discount percentage
  calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (originalPrice <= 0 || salePrice >= originalPrice) {
      return 0
    }
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  }

  // Get promotion statistics
  async getPromotionStats(): Promise<PromotionStats> {
    console.log('Getting promotion statistics with mock data')
    const activePromotions = await this.getActivePromotions()
    const totalSavings = MOCK_PROMOTIONS.reduce((sum, promo) => {
      return sum + (promo.usedCount * (promo.type === 'percentage' ? 50 : promo.value))
    }, 0)

    const mostUsedPromotion = MOCK_PROMOTIONS.reduce((prev, current) => 
      (prev.usedCount > current.usedCount) ? prev : current
    )

    return {
      totalPromotions: MOCK_PROMOTIONS.length,
      activePromotions: activePromotions.length,
      totalSavings,
      mostUsedPromotion: mostUsedPromotion.name,
      conversionRate: 0.15 // 15% mock conversion rate
    }
  }

  // Validate promotion code
  async validatePromotionCode(code: string, orderAmount: number): Promise<{ valid: boolean; promotion?: Promotion; error?: string }> {
    console.log('Validating promotion code:', code, 'for order amount:', orderAmount)
    
    const promotion = await this.getPromotionByCode(code)
    
    if (!promotion) {
      return { valid: false, error: 'Invalid promotion code' }
    }

    if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
      return { 
        valid: false, 
        error: `Minimum order amount of $${promotion.minOrderAmount} required` 
      }
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return { valid: false, error: 'Promotion code usage limit exceeded' }
    }

    return { valid: true, promotion }
  }

  // Create new promotion (for admin)
  async createPromotion(promotionData: Omit<Promotion, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<Promotion> {
    console.log('Creating new promotion with mock data')
    const newPromotion: Promotion = {
      ...promotionData,
      id: `promo-${Date.now()}`,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    MOCK_PROMOTIONS.push(newPromotion)
    return newPromotion
  }

  // Create new deal (for admin)
  async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    console.log('Creating new deal with mock data')
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    MOCK_DEALS.push(newDeal)
    return newDeal
  }
}

export const promotionService = PromotionService.getInstance()
