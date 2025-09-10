import { Product, User, Order } from '@/types'
import { productService } from './product.service'
import { orderService } from './order.service'
import { cacheService } from './cache.service'
import { logger } from '@/lib/utils/logger'

// ============================================================================
// AI RECOMMENDATION ENGINE - Machine Learning Product Suggestions
// ============================================================================

export interface RecommendationContext {
  userId?: string
  currentProduct?: Product
  category?: string
  priceRange?: { min: number; max: number }
  userBehavior?: UserBehavior
  sessionData?: SessionData
}

export interface UserBehavior {
  viewedProducts: string[]
  purchasedProducts: string[]
  searchQueries: string[]
  categories: string[]
  pricePreferences: number[]
  brandPreferences: string[]
}

export interface SessionData {
  cartItems: string[]
  wishlistItems: string[]
  recentlyViewed: string[]
  timeSpent: { [productId: string]: number }
}

export interface RecommendationScore {
  productId: string
  score: number
  reasons: string[]
  confidence: number
}

export interface RecommendationResult {
  products: Product[]
  scores: RecommendationScore[]
  algorithm: string
  timestamp: number
}

export class AIRecommendationService {
  private userBehaviorCache = new Map<string, UserBehavior>()
  private productSimilarityMatrix = new Map<string, Map<string, number>>()
  private categoryWeights = new Map<string, number>()
  private isInitialized = false

  constructor() {
    this.initializeWeights()
  }

  private initializeWeights() {
    // Category popularity weights (can be updated based on analytics)
    this.categoryWeights.set('electronics', 0.9)
    this.categoryWeights.set('fashion', 0.85)
    this.categoryWeights.set('home', 0.8)
    this.categoryWeights.set('beauty', 0.75)
    this.categoryWeights.set('sports', 0.7)
    this.categoryWeights.set('books', 0.65)
    this.categoryWeights.set('toys', 0.6)
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      // Pre-compute product similarity matrix for better performance
      await this.computeProductSimilarities()
      this.isInitialized = true
      logger.info('AI Recommendation Service initialized')
    } catch (error) {
      logger.error('Failed to initialize AI Recommendation Service:', error)
    }
  }

  private async computeProductSimilarities() {
    const products = await productService.getAllProducts()
    
    for (let i = 0; i < products.length; i++) {
      const productA = products[i]
      const similarityMap = new Map<string, number>()
      
      for (let j = 0; j < products.length; j++) {
        if (i === j) continue
        
        const productB = products[j]
        const similarity = this.calculateProductSimilarity(productA, productB)
        
        if (similarity > 0.1) { // Only store meaningful similarities
          similarityMap.set(productB.id, similarity)
        }
      }
      
      this.productSimilarityMatrix.set(productA.id, similarityMap)
    }
  }

  private calculateProductSimilarity(productA: Product, productB: Product): number {
    let similarity = 0

    // Category similarity (40% weight)
    if (productA.category === productB.category) {
      similarity += 0.4
    } else if (this.areRelatedCategories(productA.category, productB.category)) {
      similarity += 0.2
    }

    // Price similarity (20% weight)
    const priceDiff = Math.abs(productA.price - productB.price)
    const avgPrice = (productA.price + productB.price) / 2
    const priceScore = Math.max(0, 1 - (priceDiff / avgPrice))
    similarity += priceScore * 0.2

    // Brand similarity (15% weight)
    if (productA.brand === productB.brand) {
      similarity += 0.15
    }

    // Tag/keyword similarity (15% weight)
    const tagSimilarity = this.calculateTagSimilarity(productA, productB)
    similarity += tagSimilarity * 0.15

    // Rating similarity (10% weight)
    if (productA.rating && productB.rating) {
      const ratingDiff = Math.abs(productA.rating - productB.rating)
      const ratingScore = Math.max(0, 1 - (ratingDiff / 5))
      similarity += ratingScore * 0.1
    }

    return Math.min(1, similarity)
  }

  private areRelatedCategories(categoryA: string, categoryB: string): boolean {
    const relatedCategories = {
      'electronics': ['computers', 'phones', 'accessories'],
      'fashion': ['clothing', 'shoes', 'accessories'],
      'home': ['furniture', 'decor', 'kitchen'],
      'beauty': ['skincare', 'makeup', 'fragrance'],
      'sports': ['fitness', 'outdoor', 'equipment']
    }

    for (const [main, related] of Object.entries(relatedCategories)) {
      if ((categoryA === main && related.includes(categoryB)) ||
          (categoryB === main && related.includes(categoryA))) {
        return true
      }
    }

    return false
  }

  private calculateTagSimilarity(productA: Product, productB: Product): number {
    const tagsA = this.extractTags(productA)
    const tagsB = this.extractTags(productB)
    
    if (tagsA.length === 0 || tagsB.length === 0) return 0

    const intersection = tagsA.filter(tag => tagsB.includes(tag))
    const union = [...new Set([...tagsA, ...tagsB])]
    
    return intersection.length / union.length
  }

  private extractTags(product: Product): string[] {
    const tags: string[] = []
    
    // Extract from name and description
    const text = `${product.name} ${product.description || ''}`.toLowerCase()
    const words = text.match(/\b\w{3,}\b/g) || []
    
    // Filter common words and add meaningful terms
    const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'are', 'was', 'been']
    const meaningfulWords = words.filter(word => 
      !stopWords.includes(word) && word.length > 3
    )
    
    tags.push(...meaningfulWords.slice(0, 10)) // Limit to top 10 words
    
    // Add category and brand as tags
    if (product.category) tags.push(product.category.toLowerCase())
    if (product.brand) tags.push(product.brand.toLowerCase())
    
    return [...new Set(tags)] // Remove duplicates
  }

  async getUserBehavior(userId: string): Promise<UserBehavior> {
    // Check cache first
    const cached = this.userBehaviorCache.get(userId)
    if (cached) return cached

    try {
      // Get user's order history
      const orders = await orderService.getUserOrders(userId)
      const purchasedProducts = orders.flatMap(order => 
        order.items.map(item => item.productId)
      )

      // Get user's browsing behavior (would come from analytics in real app)
      const viewedProducts = await this.getUserViewHistory(userId)
      const searchQueries = await this.getUserSearchHistory(userId)

      // Analyze preferences
      const categories = await this.analyzeUserCategories(purchasedProducts, viewedProducts)
      const pricePreferences = await this.analyzeUserPricePreferences(purchasedProducts)
      const brandPreferences = await this.analyzeUserBrandPreferences(purchasedProducts)

      const behavior: UserBehavior = {
        viewedProducts,
        purchasedProducts,
        searchQueries,
        categories,
        pricePreferences,
        brandPreferences
      }

      // Cache for 1 hour
      this.userBehaviorCache.set(userId, behavior)
      setTimeout(() => this.userBehaviorCache.delete(userId), 60 * 60 * 1000)

      return behavior
    } catch (error) {
      logger.error('Error getting user behavior:', error)
      return {
        viewedProducts: [],
        purchasedProducts: [],
        searchQueries: [],
        categories: [],
        pricePreferences: [],
        brandPreferences: []
      }
    }
  }

  private async getUserViewHistory(userId: string): Promise<string[]> {
    // In a real app, this would come from analytics/tracking
    // For now, return empty array or mock data
    return []
  }

  private async getUserSearchHistory(userId: string): Promise<string[]> {
    // In a real app, this would come from search analytics
    return []
  }

  private async analyzeUserCategories(purchasedIds: string[], viewedIds: string[]): Promise<string[]> {
    const allIds = [...purchasedIds, ...viewedIds]
    const categoryCount = new Map<string, number>()

    for (const productId of allIds) {
      try {
        const product = await productService.getProductById(productId)
        if (product?.category) {
          const count = categoryCount.get(product.category) || 0
          categoryCount.set(product.category, count + 1)
        }
      } catch (error) {
        // Skip if product not found
      }
    }

    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category)
  }

  private async analyzeUserPricePreferences(purchasedIds: string[]): Promise<number[]> {
    const prices: number[] = []

    for (const productId of purchasedIds) {
      try {
        const product = await productService.getProductById(productId)
        if (product?.price) {
          prices.push(product.price)
        }
      } catch (error) {
        // Skip if product not found
      }
    }

    return prices
  }

  private async analyzeUserBrandPreferences(purchasedIds: string[]): Promise<string[]> {
    const brandCount = new Map<string, number>()

    for (const productId of purchasedIds) {
      try {
        const product = await productService.getProductById(productId)
        if (product?.brand) {
          const count = brandCount.get(product.brand) || 0
          brandCount.set(product.brand, count + 1)
        }
      } catch (error) {
        // Skip if product not found
      }
    }

    return Array.from(brandCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand]) => brand)
  }

  // Main recommendation methods
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<RecommendationResult> {
    await this.initialize()

    const cacheKey = `recommendations:${context.userId}:${JSON.stringify(context)}`
    const cached = cacheService.get<RecommendationResult>(cacheKey)
    if (cached) return cached

    try {
      let scores: RecommendationScore[] = []

      if (context.userId) {
        // Collaborative filtering + content-based
        const userBehavior = await this.getUserBehavior(context.userId)
        scores = await this.hybridRecommendation(context, userBehavior)
      } else {
        // Content-based only for anonymous users
        scores = await this.contentBasedRecommendation(context)
      }

      // Get top products
      const topScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      const products = await this.getProductsByIds(
        topScores.map(s => s.productId)
      )

      const result: RecommendationResult = {
        products,
        scores: topScores,
        algorithm: context.userId ? 'hybrid' : 'content-based',
        timestamp: Date.now()
      }

      // Cache for 30 minutes
      cacheService.set(cacheKey, result, 30 * 60 * 1000)
      return result
    } catch (error) {
      logger.error('Error generating recommendations:', error)
      return this.getFallbackRecommendations(limit)
    }
  }

  private async hybridRecommendation(
    context: RecommendationContext,
    userBehavior: UserBehavior
  ): Promise<RecommendationScore[]> {
    const scores: RecommendationScore[] = []
    const allProducts = await productService.getAllProducts()

    for (const product of allProducts) {
      // Skip if user already purchased
      if (userBehavior.purchasedProducts.includes(product.id)) continue

      let score = 0
      const reasons: string[] = []

      // Collaborative filtering (40% weight)
      const collaborativeScore = this.calculateCollaborativeScore(product, userBehavior)
      score += collaborativeScore * 0.4
      if (collaborativeScore > 0.5) {
        reasons.push('Users with similar preferences liked this')
      }

      // Content-based filtering (35% weight)
      const contentScore = this.calculateContentScore(product, userBehavior)
      score += contentScore * 0.35
      if (contentScore > 0.5) {
        reasons.push('Matches your interests')
      }

      // Popularity boost (15% weight)
      const popularityScore = this.calculatePopularityScore(product)
      score += popularityScore * 0.15
      if (popularityScore > 0.7) {
        reasons.push('Trending product')
      }

      // Context boost (10% weight)
      const contextScore = this.calculateContextScore(product, context)
      score += contextScore * 0.1
      if (contextScore > 0.5) {
        reasons.push('Relevant to current context')
      }

      if (score > 0.3) { // Only include meaningful recommendations
        scores.push({
          productId: product.id,
          score,
          reasons,
          confidence: Math.min(0.95, score)
        })
      }
    }

    return scores
  }

  private calculateCollaborativeScore(product: Product, userBehavior: UserBehavior): number {
    // Simplified collaborative filtering
    // In a real system, this would use matrix factorization or similar techniques
    
    let score = 0
    
    // Category preference
    if (userBehavior.categories.includes(product.category)) {
      score += 0.4
    }
    
    // Brand preference
    if (product.brand && userBehavior.brandPreferences.includes(product.brand)) {
      score += 0.3
    }
    
    // Price preference
    if (userBehavior.pricePreferences.length > 0) {
      const avgUserPrice = userBehavior.pricePreferences.reduce((a, b) => a + b, 0) / userBehavior.pricePreferences.length
      const priceDiff = Math.abs(product.price - avgUserPrice) / avgUserPrice
      score += Math.max(0, 0.3 * (1 - priceDiff))
    }
    
    return Math.min(1, score)
  }

  private calculateContentScore(product: Product, userBehavior: UserBehavior): number {
    let score = 0
    
    // Similar to purchased products
    for (const purchasedId of userBehavior.purchasedProducts) {
      const similarity = this.productSimilarityMatrix.get(purchasedId)?.get(product.id) || 0
      score = Math.max(score, similarity)
    }
    
    // Similar to viewed products
    for (const viewedId of userBehavior.viewedProducts) {
      const similarity = this.productSimilarityMatrix.get(viewedId)?.get(product.id) || 0
      score = Math.max(score, similarity * 0.7) // Lower weight for views vs purchases
    }
    
    return score
  }

  private calculatePopularityScore(product: Product): number {
    // Simple popularity based on rating and review count
    const ratingScore = (product.rating || 0) / 5
    const reviewScore = Math.min(1, (product.reviewCount || 0) / 100)
    
    return (ratingScore * 0.7) + (reviewScore * 0.3)
  }

  private calculateContextScore(product: Product, context: RecommendationContext): number {
    let score = 0
    
    // Category context
    if (context.category && product.category === context.category) {
      score += 0.5
    }
    
    // Price range context
    if (context.priceRange) {
      if (product.price >= context.priceRange.min && product.price <= context.priceRange.max) {
        score += 0.3
      }
    }
    
    // Current product similarity
    if (context.currentProduct) {
      const similarity = this.productSimilarityMatrix.get(context.currentProduct.id)?.get(product.id) || 0
      score += similarity * 0.2
    }
    
    return Math.min(1, score)
  }

  private async contentBasedRecommendation(context: RecommendationContext): Promise<RecommendationScore[]> {
    const scores: RecommendationScore[] = []
    const allProducts = await productService.getAllProducts()

    for (const product of allProducts) {
      let score = 0
      const reasons: string[] = []

      // Category weight
      const categoryWeight = this.categoryWeights.get(product.category) || 0.5
      score += categoryWeight * 0.4

      // Rating and popularity
      const popularityScore = this.calculatePopularityScore(product)
      score += popularityScore * 0.3
      if (popularityScore > 0.7) {
        reasons.push('Highly rated product')
      }

      // Context relevance
      const contextScore = this.calculateContextScore(product, context)
      score += contextScore * 0.3
      if (contextScore > 0.5) {
        reasons.push('Matches your search criteria')
      }

      if (score > 0.4) {
        scores.push({
          productId: product.id,
          score,
          reasons,
          confidence: Math.min(0.8, score) // Lower confidence for content-only
        })
      }
    }

    return scores
  }

  private async getFallbackRecommendations(limit: number): Promise<RecommendationResult> {
    // Fallback to popular/trending products
    const products = await productService.getNewestProducts(limit)
    
    return {
      products,
      scores: products.map((product, index) => ({
        productId: product.id,
        score: 0.8 - (index * 0.05),
        reasons: ['Popular product'],
        confidence: 0.6
      })),
      algorithm: 'fallback',
      timestamp: Date.now()
    }
  }

  private async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const products: Product[] = []
    
    for (const id of productIds) {
      try {
        const product = await productService.getProductById(id)
        if (product) {
          products.push(product)
        }
      } catch (error) {
        logger.warn(`Product not found: ${id}`)
      }
    }
    
    return products
  }

  // Utility methods for specific use cases
  async getSimilarProducts(productId: string, limit: number = 5): Promise<Product[]> {
    const similarities = this.productSimilarityMatrix.get(productId)
    if (!similarities) return []

    const sortedSimilar = Array.from(similarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)

    return this.getProductsByIds(sortedSimilar)
  }

  async getRecommendationsForCategory(category: string, limit: number = 10): Promise<Product[]> {
    const context: RecommendationContext = { category }
    const result = await this.getPersonalizedRecommendations(context, limit)
    return result.products
  }

  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    const products = await productService.getAllProducts()
    
    return products
      .sort((a, b) => {
        const scoreA = this.calculatePopularityScore(a)
        const scoreB = this.calculatePopularityScore(b)
        return scoreB - scoreA
      })
      .slice(0, limit)
  }

  // Analytics and insights
  getRecommendationInsights(userId: string) {
    const behavior = this.userBehaviorCache.get(userId)
    if (!behavior) return null

    return {
      topCategories: behavior.categories.slice(0, 3),
      averagePrice: behavior.pricePreferences.reduce((a, b) => a + b, 0) / behavior.pricePreferences.length || 0,
      topBrands: behavior.brandPreferences.slice(0, 3),
      totalPurchases: behavior.purchasedProducts.length,
      totalViews: behavior.viewedProducts.length
    }
  }
}

// Export singleton instance
export const aiRecommendationService = new AIRecommendationService()

// React hook for recommendations
export function useRecommendations(context: RecommendationContext, limit: number = 10) {
  return {
    getRecommendations: () => aiRecommendationService.getPersonalizedRecommendations(context, limit),
    getSimilarProducts: (productId: string) => aiRecommendationService.getSimilarProducts(productId, 5),
    getTrending: () => aiRecommendationService.getTrendingProducts(limit)
  }
}
