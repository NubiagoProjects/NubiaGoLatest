// ============================================================================
// FIREBASE SERVICE SINGLETON MANAGER
// ============================================================================

import { productService } from './services/product.service'
import { cartService } from './services/cart.service'
import { wishlistService } from './services/wishlist.service'
import { authService } from './services/auth.service'
import { orderService } from './services/order.service'
import { paymentService } from './services/payment.service'
import { userService } from './services/user.service'
import { emailService } from './services/email.service'
import { storageService } from './services/storage.service'
import { auditService } from './services/audit.service'
import { analyticsService } from './services/analytics.service'
import { searchService } from './services/search.service'
import { logisticsService } from './services/logistics.service'
import { mobileMoneyService } from './services/mobile-money.service'
import { apiService } from './services/api.service'
import { adminUserService } from './services/admin/admin-user.service'
import { adminSupplierService } from './services/admin/admin-supplier.service'
import { promotionService } from './services/promotion.service'

type ServiceConstructor<T = any> = new (...args: any[]) => T

class ServiceManager {
  private static instances = new Map<ServiceConstructor, any>()
  private static initializationPromises = new Map<ServiceConstructor, Promise<any>>()

  /**
   * Get singleton instance of a service
   */
  static getInstance<T>(ServiceClass: ServiceConstructor<T>): T {
    if (!this.instances.has(ServiceClass)) {
      logger.debug(`Initializing service: ${ServiceClass.name}`)
      const instance = new ServiceClass()
      this.instances.set(ServiceClass, instance)
      
      // Track service initialization for performance monitoring
      logger.performance(`Service initialized: ${ServiceClass.name}`, 0)
    }
    
    return this.instances.get(ServiceClass)
  }

  /**
   * Get singleton instance with async initialization
   */
  static async getInstanceAsync<T>(ServiceClass: ServiceConstructor<T>): Promise<T> {
    if (!this.initializationPromises.has(ServiceClass)) {
      const promise = this.initializeServiceAsync(ServiceClass)
      this.initializationPromises.set(ServiceClass, promise)
    }
    
    return this.initializationPromises.get(ServiceClass)
  }

  /**
   * Initialize service asynchronously
   */
  private static async initializeServiceAsync<T>(ServiceClass: ServiceConstructor<T>): Promise<T> {
    const startTime = performance.now()
    
    try {
      const instance = new ServiceClass()
      
      // If service has an initialize method, call it
      if (typeof (instance as any).initialize === 'function') {
        await (instance as any).initialize()
      }
      
      this.instances.set(ServiceClass, instance)
      
      const duration = performance.now() - startTime
      logger.performance(`Service async initialized: ${ServiceClass.name}`, duration)
      
      return instance
    } catch (error) {
      logger.error(`Failed to initialize service: ${ServiceClass.name}`, error as Error)
      throw error
    }
  }

  /**
   * Preload critical services
   */
  static preloadCriticalServices() {
    const criticalServices: ServiceConstructor[] = [
      // ProductService, // Using productService instance instead
      UserService,
      AuthService,
      CartService,
      WishlistService
    ]

    criticalServices.forEach(ServiceClass => {
      this.getInstance(ServiceClass)
    })

    logger.info('Critical services preloaded')
  }

  /**
   * Clear all service instances (useful for testing)
   */
  static clearInstances() {
    this.instances.clear()
    this.initializationPromises.clear()
    logger.debug('All service instances cleared')
  }

  /**
   * Get service health status
   */
  static getServiceHealth() {
    const services = Array.from(this.instances.entries()).map(([ServiceClass, instance]) => ({
      name: ServiceClass.name,
      initialized: !!instance,
      hasHealthCheck: typeof (instance as any).healthCheck === 'function'
    }))

    return {
      totalServices: this.instances.size,
      services
    }
  }

  /**
   * Perform health check on all services
   */
  static async performHealthCheck() {
    const results = []
    
    for (const [ServiceClass, instance] of this.instances.entries()) {
      const serviceName = ServiceClass.name
      
      try {
        if (typeof (instance as any).healthCheck === 'function') {
          const startTime = performance.now()
          const isHealthy = await (instance as any).healthCheck()
          const duration = performance.now() - startTime
          
          results.push({
            service: serviceName,
            healthy: isHealthy,
            responseTime: duration
          })
        } else {
          results.push({
            service: serviceName,
            healthy: true,
            responseTime: 0,
            note: 'No health check method'
          })
        }
      } catch (error) {
        logger.error(`Health check failed for ${serviceName}`, error as Error)
        results.push({
          service: serviceName,
          healthy: false,
          error: (error as Error).message
        })
      }
    }

    return results
  }
}

// Preload critical services on initialization
if (typeof window !== 'undefined') {
  // Client-side initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ServiceManager.preloadCriticalServices()
    })
  } else {
    ServiceManager.preloadCriticalServices()
  }
}

export default ServiceManager

// Convenience exports for commonly used services
export const {
  productService,
  userService,
  orderService,
  cartService,
  authService,
  emailService,
  emailVerificationService,
  promotionService,
  supplierService,
  adminService,
  auditService,
  apiService,
  notificationService,
  performanceService,
  shippingService,
  paymentService,
  inventoryService,
  reviewService,
  wishlistService,
  searchService,
  analyticsService,
  reportService
} = ServiceManager.getInstance()

export { cacheService } from './services/cache.service'
export { securityMiddleware } from './middleware/security.middleware'
export { aiRecommendationService } from './services/ai-recommendation.service'
export const getLogisticsService = () => logisticsService
export const getStorageService = () => storageService
export const getAuditService = () => auditService
export const getEmailService = () => emailService
export const getAnalyticsService = () => analyticsService
export const getSearchService = () => searchService
export const getUserService = () => userService
export const getPaymentService = () => paymentService
export const getMobileMoneyService = () => mobileMoneyService
export const getPromotionService = () => promotionService
