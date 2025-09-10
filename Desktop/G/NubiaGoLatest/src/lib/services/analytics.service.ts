import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export class AnalyticsService {
  // Track page view
  async trackPageView(page: string, userId?: string, sessionId?: string): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'analytics', 'page_views'))
      await setDoc(analyticsRef, {
        page,
        userId,
        sessionId,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : ''
      })
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  // Track product view
  async trackProductView(productId: string, userId?: string): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'analytics', 'product_views'))
      await setDoc(analyticsRef, {
        productId,
        userId,
        timestamp: new Date()
      })

      // Update product view count
      const productRef = doc(db, 'products', productId)
      await updateDoc(productRef, {
        viewCount: increment(1)
      })
    } catch (error) {
      console.error('Error tracking product view:', error)
    }
  }

  // Track add to cart
  async trackAddToCart(productId: string, userId: string, quantity: number): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'analytics', 'cart_events'))
      await setDoc(analyticsRef, {
        productId,
        userId,
        quantity,
        action: 'add_to_cart',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error tracking add to cart:', error)
    }
  }

  // Track purchase
  async trackPurchase(orderId: string, userId: string, total: number, items: any[]): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'analytics', 'purchases'))
      await setDoc(analyticsRef, {
        orderId,
        userId,
        total,
        items,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error tracking purchase:', error)
    }
  }

  // Track search
  async trackSearch(query: string, results: number, userId?: string): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'analytics', 'searches'))
      await setDoc(analyticsRef, {
        query,
        results,
        userId,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error tracking search:', error)
    }
  }

  // Get sales analytics
  async getSalesAnalytics(startDate: Date, endDate: Date): Promise<{
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    topProducts: Array<{ productId: string; sales: number }>
    dailySales: Array<{ date: string; sales: number }>
  }> {
    try {
      const q = query(
        collection(db, 'analytics', 'purchases'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      )

      const snapshot = await getDocs(q)
      const purchases = snapshot.docs.map(doc => doc.data())

      const totalSales = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
      const totalOrders = purchases.length
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

      // Calculate top products
      const productSales: { [key: string]: number } = {}
      purchases.forEach(purchase => {
        purchase.items.forEach((item: any) => {
          productSales[item.productId] = (productSales[item.productId] || 0) + (item.price * item.quantity)
        })
      })

      const topProducts = Object.entries(productSales)
        .map(([productId, sales]) => ({ productId, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10)

      // Calculate daily sales
      const dailySales: { [key: string]: number } = {}
      purchases.forEach(purchase => {
        const date = purchase.timestamp.toDate().toISOString().split('T')[0]
        dailySales[date] = (dailySales[date] || 0) + purchase.total
      })

      const dailySalesArray = Object.entries(dailySales)
        .map(([date, sales]) => ({ date, sales }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        totalSales,
        totalOrders,
        averageOrderValue,
        topProducts,
        dailySales: dailySalesArray
      }
    } catch (error) {
      console.error('Error getting sales analytics:', error)
      throw new Error('Failed to get sales analytics')
    }
  }

  // Get user analytics
  async getUserAnalytics(): Promise<{
    totalUsers: number
    activeUsers: number
    newUsers: number
    userRetention: number
  }> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const totalUsers = usersSnapshot.size

      const activeUsersSnapshot = await getDocs(
        query(collection(db, 'users'), where('status', '==', 'active')));
      const activeUsers = activeUsersSnapshot.size

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const newUsersSnapshot = await getDocs(
        query(collection(db, 'users'), where('createdAt', '>=', thirtyDaysAgo)));
      const newUsers = newUsersSnapshot.size

      const userRetention = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0

      return {
        totalUsers,
        activeUsers,
        newUsers,
        userRetention
      }
    } catch (error) {
      console.error('Error getting user analytics:', error)
      throw new Error('Failed to get user analytics')
    }
  }

  // Get product analytics
  async getProductAnalytics(): Promise<{
    totalProducts: number
    activeProducts: number
    topViewedProducts: Array<{ productId: string; views: number }>
    topSellingProducts: Array<{ productId: string; sales: number }>
  }> {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const totalProducts = productsSnapshot.size

      const activeProductsSnapshot = await getDocs(
        query(collection(db, 'products'), where('isActive', '==', true)));
      const activeProducts = activeProductsSnapshot.size

      // Get top viewed products
      const topViewedProducts = productsSnapshot.docs
        .map(doc => ({ productId: doc.id, views: doc.data().viewCount || 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      // Get top selling products (from sales analytics)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const salesSnapshot = await getDocs(
        query(collection(db, 'analytics', 'purchases'), where('timestamp', '>=', thirtyDaysAgo)));
      
      const productSales: { [key: string]: number } = {}
      salesSnapshot.docs.forEach(doc => {
        const purchase = doc.data()
        purchase.items.forEach((item: any) => {
          productSales[item.productId] = (productSales[item.productId] || 0) + (item.price * item.quantity)
        })
      })

      const topSellingProducts = Object.entries(productSales)
        .map(([productId, sales]) => ({ productId, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10)

      return {
        totalProducts,
        activeProducts,
        topViewedProducts,
        topSellingProducts
      }
    } catch (error) {
      console.error('Error getting product analytics:', error)
      throw new Error('Failed to get product analytics')
    }
  }

  // Get conversion analytics
  async getConversionAnalytics(): Promise<{
    cartToPurchaseRate: number
    viewToCartRate: number
    searchToPurchaseRate: number
  }> {
    try {
      // Calculate conversion rates
      const cartEventsSnapshot = await getDocs(collection(db, 'analytics', 'cart_events'))
      const purchasesSnapshot = await getDocs(collection(db, 'analytics', 'purchases'))
      const productViewsSnapshot = await getDocs(collection(db, 'analytics', 'product_views'))

      const addToCartCount = cartEventsSnapshot.docs.filter(doc => 
        doc.data().action === 'add_to_cart'
      ).length

      const purchaseCount = purchasesSnapshot.size
      const productViewCount = productViewsSnapshot.size

      const cartToPurchaseRate = addToCartCount > 0 ? (purchaseCount / addToCartCount) * 100 : 0
      const viewToCartRate = productViewCount > 0 ? (addToCartCount / productViewCount) * 100 : 0

      // Search to purchase rate (simplified)
      const searchesSnapshot = await getDocs(collection(db, 'analytics', 'searches'))
      const searchCount = searchesSnapshot.size
      const searchToPurchaseRate = searchCount > 0 ? (purchaseCount / searchCount) * 100 : 0

      return {
        cartToPurchaseRate,
        viewToCartRate,
        searchToPurchaseRate
      }
    } catch (error) {
      console.error('Error getting conversion analytics:', error)
      throw new Error('Failed to get conversion analytics')
    }
  }

  // Track custom event
  async trackCustomEvent(eventName: string, data: any, userId?: string): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'analytics', 'custom_events'))
      await setDoc(analyticsRef, {
        eventName,
        data,
        userId,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error tracking custom event:', error)
    }
  }
}

export const analyticsService = new AnalyticsService() 
