'use client'

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  Timestamp,
  increment
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/firestore'

const db = getFirebaseFirestore()

// ============================================================================
// RECOMMENDATION ANALYTICS SERVICE
// ============================================================================

export interface RecommendationEvent {
  id?: string
  userId?: string
  sessionId: string
  eventType: 'view' | 'click' | 'add_to_cart' | 'add_to_wishlist' | 'purchase'
  productId: string
  recommendationId: string
  algorithm: string
  position: number
  context: {
    page: string
    category?: string
    searchQuery?: string
    currentProduct?: string
  }
  timestamp: Date
  metadata?: {
    confidence?: number
    reason?: string
    source?: string
    revenue?: number
  }
}

export interface RecommendationMetrics {
  totalRecommendations: number
  totalClicks: number
  totalConversions: number
  clickThroughRate: number
  conversionRate: number
  revenueGenerated: number
  topPerformingAlgorithms: Array<{
    algorithm: string
    clicks: number
    conversions: number
    ctr: number
  }>
  categoryPerformance: Array<{
    category: string
    clicks: number
    conversions: number
    ctr: number
  }>
}

export interface RecommendationPerformance {
  productId: string
  productName: string
  totalViews: number
  totalClicks: number
  totalConversions: number
  clickThroughRate: number
  conversionRate: number
  averagePosition: number
  revenue: number
}

class RecommendationAnalyticsService {
  private readonly COLLECTION_NAME = 'recommendation_events'
  private readonly METRICS_COLLECTION = 'recommendation_metrics'
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Track recommendation events
  async trackRecommendationEvent(event: Omit<RecommendationEvent, 'id' | 'timestamp' | 'sessionId'>): Promise<void> {
    try {
      const eventData: RecommendationEvent = {
        ...event,
        sessionId: this.sessionId,
        timestamp: new Date()
      }

      await addDoc(collection(db, this.COLLECTION_NAME), {
        ...eventData,
        timestamp: Timestamp.fromDate(eventData.timestamp)
      })

      // Update real-time metrics
      await this.updateMetrics(eventData)
    } catch (error) {
      console.error('Error tracking recommendation event:', error)
    }
  }

  // Track recommendation view
  async trackRecommendationView(
    productId: string,
    recommendationId: string,
    algorithm: string,
    position: number,
    context: RecommendationEvent['context'],
    userId?: string,
    metadata?: RecommendationEvent['metadata']
  ): Promise<void> {
    await this.trackRecommendationEvent({
      userId,
      eventType: 'view',
      productId,
      recommendationId,
      algorithm,
      position,
      context,
      metadata
    })
  }

  // Track recommendation click
  async trackRecommendationClick(
    productId: string,
    recommendationId: string,
    algorithm: string,
    position: number,
    context: RecommendationEvent['context'],
    userId?: string,
    metadata?: RecommendationEvent['metadata']
  ): Promise<void> {
    await this.trackRecommendationEvent({
      userId,
      eventType: 'click',
      productId,
      recommendationId,
      algorithm,
      position,
      context,
      metadata
    })
  }

  // Track add to cart from recommendation
  async trackRecommendationAddToCart(
    productId: string,
    recommendationId: string,
    algorithm: string,
    position: number,
    context: RecommendationEvent['context'],
    userId?: string,
    metadata?: RecommendationEvent['metadata']
  ): Promise<void> {
    await this.trackRecommendationEvent({
      userId,
      eventType: 'add_to_cart',
      productId,
      recommendationId,
      algorithm,
      position,
      context,
      metadata
    })
  }

  // Track add to wishlist from recommendation
  async trackRecommendationAddToWishlist(
    productId: string,
    recommendationId: string,
    algorithm: string,
    position: number,
    context: RecommendationEvent['context'],
    userId?: string,
    metadata?: RecommendationEvent['metadata']
  ): Promise<void> {
    await this.trackRecommendationEvent({
      userId,
      eventType: 'add_to_wishlist',
      productId,
      recommendationId,
      algorithm,
      position,
      context,
      metadata
    })
  }

  // Track purchase from recommendation
  async trackRecommendationPurchase(
    productId: string,
    recommendationId: string,
    algorithm: string,
    position: number,
    context: RecommendationEvent['context'],
    revenue: number,
    userId?: string,
    metadata?: RecommendationEvent['metadata']
  ): Promise<void> {
    await this.trackRecommendationEvent({
      userId,
      eventType: 'purchase',
      productId,
      recommendationId,
      algorithm,
      position,
      context,
      metadata: {
        ...metadata,
        revenue
      }
    })
  }

  // Update real-time metrics
  private async updateMetrics(event: RecommendationEvent): Promise<void> {
    try {
      const metricsRef = doc(db, this.METRICS_COLLECTION, 'global')
      const today = new Date().toISOString().split('T')[0]
      
      const updates: any = {}
      
      switch (event.eventType) {
        case 'view':
          updates[`daily.${today}.views`] = increment(1)
          updates[`algorithms.${event.algorithm}.views`] = increment(1)
          if (event.context.category) {
            updates[`categories.${event.context.category}.views`] = increment(1)
          }
          break
          
        case 'click':
          updates[`daily.${today}.clicks`] = increment(1)
          updates[`algorithms.${event.algorithm}.clicks`] = increment(1)
          if (event.context.category) {
            updates[`categories.${event.context.category}.clicks`] = increment(1)
          }
          break
          
        case 'add_to_cart':
        case 'add_to_wishlist':
          updates[`daily.${today}.conversions`] = increment(1)
          updates[`algorithms.${event.algorithm}.conversions`] = increment(1)
          if (event.context.category) {
            updates[`categories.${event.context.category}.conversions`] = increment(1)
          }
          break
          
        case 'purchase':
          updates[`daily.${today}.purchases`] = increment(1)
          updates[`daily.${today}.revenue`] = increment(event.metadata?.revenue || 0)
          updates[`algorithms.${event.algorithm}.purchases`] = increment(1)
          updates[`algorithms.${event.algorithm}.revenue`] = increment(event.metadata?.revenue || 0)
          if (event.context.category) {
            updates[`categories.${event.context.category}.purchases`] = increment(1)
            updates[`categories.${event.context.category}.revenue`] = increment(event.metadata?.revenue || 0)
          }
          break
      }

      await updateDoc(metricsRef, updates)
    } catch (error) {
      console.error('Error updating metrics:', error)
    }
  }

  // Get recommendation metrics for a date range
  async getRecommendationMetrics(
    startDate: Date,
    endDate: Date,
    algorithm?: string,
    category?: string
  ): Promise<RecommendationMetrics> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      )

      if (algorithm) {
        q = query(q, where('algorithm', '==', algorithm))
      }

      if (category) {
        q = query(q, where('context.category', '==', category))
      }

      const snapshot = await getDocs(q)
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecommendationEvent[]

      return this.calculateMetrics(events)
    } catch (error) {
      console.error('Error getting recommendation metrics:', error)
      return this.getEmptyMetrics()
    }
  }

  // Calculate metrics from events
  private calculateMetrics(events: RecommendationEvent[]): RecommendationMetrics {
    const views = events.filter(e => e.eventType === 'view')
    const clicks = events.filter(e => e.eventType === 'click')
    const conversions = events.filter(e => ['add_to_cart', 'add_to_wishlist', 'purchase'].includes(e.eventType))
    const purchases = events.filter(e => e.eventType === 'purchase')

    const totalRecommendations = views.length
    const totalClicks = clicks.length
    const totalConversions = conversions.length
    const clickThroughRate = totalRecommendations > 0 ? (totalClicks / totalRecommendations) * 100 : 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    const revenueGenerated = purchases.reduce((sum, p) => sum + (p.metadata?.revenue || 0), 0)

    // Algorithm performance
    const algorithmStats = new Map<string, { views: number; clicks: number; conversions: number }>()
    events.forEach(event => {
      if (!algorithmStats.has(event.algorithm)) {
        algorithmStats.set(event.algorithm, { views: 0, clicks: 0, conversions: 0 })
      }
      const stats = algorithmStats.get(event.algorithm)!
      
      if (event.eventType === 'view') stats.views++
      else if (event.eventType === 'click') stats.clicks++
      else if (['add_to_cart', 'add_to_wishlist', 'purchase'].includes(event.eventType)) stats.conversions++
    })

    const topPerformingAlgorithms = Array.from(algorithmStats.entries()).map(([algorithm, stats]) => ({
      algorithm,
      clicks: stats.clicks,
      conversions: stats.conversions,
      ctr: stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0
    })).sort((a, b) => b.ctr - a.ctr)

    // Category performance
    const categoryStats = new Map<string, { views: number; clicks: number; conversions: number }>()
    events.forEach(event => {
      const category = event.context.category || 'Unknown'
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { views: 0, clicks: 0, conversions: 0 })
      }
      const stats = categoryStats.get(category)!
      
      if (event.eventType === 'view') stats.views++
      else if (event.eventType === 'click') stats.clicks++
      else if (['add_to_cart', 'add_to_wishlist', 'purchase'].includes(event.eventType)) stats.conversions++
    })

    const categoryPerformance = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      clicks: stats.clicks,
      conversions: stats.conversions,
      ctr: stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0
    })).sort((a, b) => b.ctr - a.ctr)

    return {
      totalRecommendations,
      totalClicks,
      totalConversions,
      clickThroughRate,
      conversionRate,
      revenueGenerated,
      topPerformingAlgorithms,
      categoryPerformance
    }
  }

  // Get product recommendation performance
  async getProductRecommendationPerformance(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RecommendationPerformance | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('productId', '==', productId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(q)
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecommendationEvent[]

      if (events.length === 0) return null

      const views = events.filter(e => e.eventType === 'view')
      const clicks = events.filter(e => e.eventType === 'click')
      const conversions = events.filter(e => ['add_to_cart', 'add_to_wishlist', 'purchase'].includes(e.eventType))
      const purchases = events.filter(e => e.eventType === 'purchase')

      const totalViews = views.length
      const totalClicks = clicks.length
      const totalConversions = conversions.length
      const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      const averagePosition = events.reduce((sum, e) => sum + e.position, 0) / events.length
      const revenue = purchases.reduce((sum, p) => sum + (p.metadata?.revenue || 0), 0)

      return {
        productId,
        productName: 'Product Name', // Would need to fetch from product service
        totalViews,
        totalClicks,
        totalConversions,
        clickThroughRate,
        conversionRate,
        averagePosition,
        revenue
      }
    } catch (error) {
      console.error('Error getting product recommendation performance:', error)
      return null
    }
  }

  // Get top performing recommended products
  async getTopPerformingRecommendations(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<RecommendationPerformance[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(q)
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecommendationEvent[]

      // Group by product ID
      const productStats = new Map<string, RecommendationEvent[]>()
      events.forEach(event => {
        if (!productStats.has(event.productId)) {
          productStats.set(event.productId, [])
        }
        productStats.get(event.productId)!.push(event)
      })

      // Calculate performance for each product
      const performances: RecommendationPerformance[] = []
      for (const [productId, productEvents] of productStats.entries()) {
        const views = productEvents.filter(e => e.eventType === 'view')
        const clicks = productEvents.filter(e => e.eventType === 'click')
        const conversions = productEvents.filter(e => ['add_to_cart', 'add_to_wishlist', 'purchase'].includes(e.eventType))
        const purchases = productEvents.filter(e => e.eventType === 'purchase')

        const totalViews = views.length
        const totalClicks = clicks.length
        const totalConversions = conversions.length
        const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
        const averagePosition = productEvents.reduce((sum, e) => sum + e.position, 0) / productEvents.length
        const revenue = purchases.reduce((sum, p) => sum + (p.metadata?.revenue || 0), 0)

        performances.push({
          productId,
          productName: 'Product Name', // Would need to fetch from product service
          totalViews,
          totalClicks,
          totalConversions,
          clickThroughRate,
          conversionRate,
          averagePosition,
          revenue
        })
      }

      // Sort by click-through rate and return top performers
      return performances
        .sort((a, b) => b.clickThroughRate - a.clickThroughRate)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting top performing recommendations:', error)
      return []
    }
  }

  private getEmptyMetrics(): RecommendationMetrics {
    return {
      totalRecommendations: 0,
      totalClicks: 0,
      totalConversions: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      revenueGenerated: 0,
      topPerformingAlgorithms: [],
      categoryPerformance: []
    }
  }
}

export const recommendationAnalyticsService = new RecommendationAnalyticsService()
