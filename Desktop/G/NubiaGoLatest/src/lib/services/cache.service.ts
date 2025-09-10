import { Product, User, Order } from '@/types'

// ============================================================================
// CACHE SERVICE - Performance Optimization
// ============================================================================

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  key: string
}

export interface CacheConfig {
  defaultTTL: number
  maxSize: number
  cleanupInterval: number
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private cleanupTimer?: NodeJS.Timeout

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    }

    // Start cleanup timer
    this.startCleanup()
  }

  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    // If cache is still too large, remove oldest entries
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = entries.slice(0, this.cache.size - this.config.maxSize)
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cache wrapper for async functions
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }

  // Product-specific caching methods
  cacheProduct(product: Product, ttl?: number): void {
    this.set(`product:${product.id}`, product, ttl)
  }

  getCachedProduct(productId: string): Product | null {
    return this.get<Product>(`product:${productId}`)
  }

  cacheProducts(products: Product[], cacheKey: string, ttl?: number): void {
    this.set(`products:${cacheKey}`, products, ttl)
  }

  getCachedProducts(cacheKey: string): Product[] | null {
    return this.get<Product[]>(`products:${cacheKey}`)
  }

  // User-specific caching
  cacheUser(user: User, ttl?: number): void {
    this.set(`user:${user.id}`, user, ttl)
  }

  getCachedUser(userId: string): User | null {
    return this.get<User>(`user:${userId}`)
  }

  // Search results caching
  cacheSearchResults(query: string, results: Product[], ttl?: number): void {
    const searchKey = `search:${this.hashString(query)}`
    this.set(searchKey, results, ttl || 2 * 60 * 1000) // 2 minutes for search
  }

  getCachedSearchResults(query: string): Product[] | null {
    const searchKey = `search:${this.hashString(query)}`
    return this.get<Product[]>(searchKey)
  }

  // API response caching
  cacheApiResponse<T>(endpoint: string, params: any, response: T, ttl?: number): void {
    const key = `api:${endpoint}:${this.hashString(JSON.stringify(params))}`
    this.set(key, response, ttl)
  }

  getCachedApiResponse<T>(endpoint: string, params: any): T | null {
    const key = `api:${endpoint}:${this.hashString(JSON.stringify(params))}`
    return this.get<T>(key)
  }

  // Image caching for better performance
  cacheImage(url: string, blob: Blob, ttl?: number): void {
    this.set(`image:${url}`, blob, ttl || 30 * 60 * 1000) // 30 minutes
  }

  getCachedImage(url: string): Blob | null {
    return this.get<Blob>(`image:${url}`)
  }

  // Category and filter caching
  cacheCategories(categories: any[], ttl?: number): void {
    this.set('categories', categories, ttl || 10 * 60 * 1000) // 10 minutes
  }

  getCachedCategories(): any[] | null {
    return this.get<any[]>('categories')
  }

  // Cart caching for better UX
  cacheCart(userId: string, cart: any, ttl?: number): void {
    this.set(`cart:${userId}`, cart, ttl || 60 * 60 * 1000) // 1 hour
  }

  getCachedCart(userId: string): any | null {
    return this.get<any>(`cart:${userId}`)
  }

  // Invalidation methods
  invalidateProduct(productId: string): void {
    this.delete(`product:${productId}`)
    // Also invalidate related caches
    this.invalidatePattern('products:')
    this.invalidatePattern('search:')
  }

  invalidateUser(userId: string): void {
    this.delete(`user:${userId}`)
    this.delete(`cart:${userId}`)
  }

  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Utility methods
  private hashString(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString()
  }

  // Statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        age: Date.now() - entry.timestamp
      }))
    }
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }
}

// Export singleton instance
export const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 500, // Reasonable size for browser
  cleanupInterval: 2 * 60 * 1000 // 2 minutes
})

// React hook for cache usage
export function useCache() {
  return {
    get: <T>(key: string) => cacheService.get<T>(key),
    set: <T>(key: string, data: T, ttl?: number) => cacheService.set(key, data, ttl),
    getOrSet: <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => 
      cacheService.getOrSet(key, fetcher, ttl),
    invalidate: (key: string) => cacheService.delete(key),
    invalidatePattern: (pattern: string) => cacheService.invalidatePattern(pattern)
  }
}
