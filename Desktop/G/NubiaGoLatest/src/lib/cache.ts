/**
 * Enhanced Caching Service
 * Provides in-memory caching with TTL, LRU eviction, and persistence
 */

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  persist?: boolean // Whether to persist to localStorage
  namespace?: string // Namespace for cache keys
}

export interface CacheEntry<T = any> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

export class EnhancedCache {
  private cache: Map<string, CacheEntry> = new Map()
  private options: Required<CacheOptions>
  private namespace: string

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      persist: options.persist || false,
      namespace: options.namespace || 'app-cache'
    }
    
    this.namespace = this.options.namespace
    
    // Load persisted cache if enabled
    if (this.options.persist && typeof window !== 'undefined') {
      this.loadFromStorage()
    }
    
    // Setup cleanup interval
    this.setupCleanup()
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const fullKey = this.getNamespacedKey(key)
    const entry: CacheEntry<T> = {
      value,
        timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    // Check if we need to evict items
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    this.cache.set(fullKey, entry)
    
    // Persist to storage if enabled
    if (this.options.persist) {
      this.persistToStorage()
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const fullKey = this.getNamespacedKey(key)
    const entry = this.cache.get(fullKey)

    if (!entry) {
        return null
      }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(fullKey)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()

    return entry.value
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    const fullKey = this.getNamespacedKey(key)
    const entry = this.cache.get(fullKey)
    
    if (!entry) {
      return false
    }

    if (this.isExpired(entry)) {
      this.cache.delete(fullKey)
      return false
    }

    return true
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    const fullKey = this.getNamespacedKey(key)
    const deleted = this.cache.delete(fullKey)
    
    if (deleted && this.options.persist) {
      this.persistToStorage()
    }
    
    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    
    if (this.options.persist) {
      this.persistToStorage()
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalHits: number
    totalMisses: number
    averageTTL: number
  } {
    let totalHits = 0
    let totalMisses = 0
    let totalTTL = 0
    let validEntries = 0

    for (const entry of this.cache.values()) {
      if (!this.isExpired(entry)) {
        totalHits += entry.accessCount
        totalTTL += entry.ttl
        validEntries++
      }
    }

    const hitRate = totalHits + totalMisses > 0 
      ? totalHits / (totalHits + totalMisses) 
      : 0

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate,
      totalHits,
      totalMisses,
      averageTTL: validEntries > 0 ? totalTTL / validEntries : 0
    }
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    const keys: string[] = []
    
    for (const key of this.cache.keys()) {
      const entry = this.cache.get(key)
      if (entry && !this.isExpired(entry)) {
        // Remove namespace prefix
        keys.push(key.replace(`${this.namespace}:`, ''))
      }
    }
    
    return keys
  }

  /**
   * Get all values in the cache
   */
  values<T>(): T[] {
    const values: T[] = []
    
    for (const entry of this.cache.values()) {
      if (!this.isExpired(entry)) {
        values.push(entry.value)
      }
    }
    
    return values
  }

  /**
   * Get all entries in the cache
   */
  entries<T>(): Array<[string, T]> {
    const entries: Array<[string, T]> = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        // Remove namespace prefix
        const cleanKey = key.replace(`${this.namespace}:`, '')
        entries.push([cleanKey, entry.value])
      }
    }
    
    return entries
  }

  /**
   * Set multiple values at once
   */
  setMany<T>(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const { key, value, ttl } of entries) {
      this.set(key, value, ttl)
    }
  }

  /**
   * Get multiple values at once
   */
  getMany<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {}
    
    for (const key of keys) {
      result[key] = this.get<T>(key)
    }
    
    return result
  }

  /**
   * Delete multiple keys at once
   */
  deleteMany(keys: string[]): number {
    let deletedCount = 0
    
    for (const key of keys) {
      if (this.delete(key)) {
        deletedCount++
      }
    }
    
    return deletedCount
  }

  /**
   * Increment a numeric value
   */
  increment(key: string, amount: number = 1): number {
    const current = this.get<number>(key) || 0
    const newValue = current + amount
    this.set(key, newValue)
    return newValue
  }

  /**
   * Decrement a numeric value
   */
  decrement(key: string, amount: number = 1): number {
    return this.increment(key, -amount)
  }

  /**
   * Set a value only if it doesn't exist
   */
  setIfNotExists<T>(key: string, value: T, ttl?: number): boolean {
    if (this.has(key)) {
      return false
    }
    
    this.set(key, value, ttl)
      return true
  }

  /**
   * Get a value and delete it (one-time use)
   */
  getAndDelete<T>(key: string): T | null {
    const value = this.get<T>(key)
    if (value !== null) {
      this.delete(key)
    }
    return value
  }

  /**
   * Extend TTL for a key
   */
  extendTTL(key: string, additionalTTL: number): boolean {
    const fullKey = this.getNamespacedKey(key)
    const entry = this.cache.get(fullKey)
    
    if (!entry || this.isExpired(entry)) {
      return false
    }
    
    entry.ttl += additionalTTL
    return true
  }

  /**
   * Get remaining TTL for a key
   */
  getTTL(key: string): number {
    const fullKey = this.getNamespacedKey(key)
    const entry = this.cache.get(fullKey)
    
    if (!entry || this.isExpired(entry)) {
      return 0
    }
    
    const elapsed = Date.now() - entry.timestamp
    return Math.max(0, entry.ttl - elapsed)
  }

  /**
   * Check if an entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Get namespaced key
   */
  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  /**
   * Evict least recently used items
   */
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries())
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
    
    // Remove oldest entries until we're under the limit
    const toRemove = entries.slice(0, entries.length - this.options.maxSize + 1)
    
    for (const [key] of toRemove) {
      this.cache.delete(key)
    }
  }

  /**
   * Setup periodic cleanup of expired entries
   */
  private setupCleanup(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanup()
      }, 60000) // Clean up every minute
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0 && this.options.persist) {
      this.persistToStorage()
    }
  }

  /**
   * Persist cache to localStorage
   */
  private persistToStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
    
    try {
      const data = {
        timestamp: Date.now(),
        entries: Array.from(this.cache.entries())
      }
      
      localStorage.setItem(this.namespace, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
    
    try {
      const stored = localStorage.getItem(this.namespace)
      if (!stored) return
      
      const data = JSON.parse(stored)
      const age = Date.now() - data.timestamp
      
      // Don't load cache older than 1 hour
      if (age > 60 * 60 * 1000) {
        try {
          localStorage.removeItem(this.namespace)
        } catch (error) {
          console.warn('Failed to remove expired cache from localStorage:', error)
        }
        return
      }
      
      // Restore entries, filtering out expired ones
      for (const [key, entry] of data.entries) {
        if (!this.isExpired(entry)) {
          this.cache.set(key, entry)
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
      try {
        localStorage.removeItem(this.namespace)
      } catch (removeError) {
        console.warn('Failed to remove corrupted cache from localStorage:', removeError)
      }
    }
  }
}

/**
 * Cache factory for creating different types of caches
 */
export class CacheFactory {
  private static caches = new Map<string, EnhancedCache>()

  /**
   * Get or create a cache instance
   */
  static getCache(name: string, options?: CacheOptions): EnhancedCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new EnhancedCache(options))
    }
    
    return this.caches.get(name)!
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
    this.caches.clear()
  }

  /**
   * Get statistics for all caches
   */
  static getAllStats(): Record<string, ReturnType<EnhancedCache['getStats']>> {
    const stats: Record<string, ReturnType<EnhancedCache['getStats']>> = {}
    
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats()
    }
    
    return stats
  }
}

/**
 * Predefined cache instances
 */
export const caches = {
  // User data cache (long TTL)
  user: CacheFactory.getCache('user', {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 500,
    persist: true
  }),

  // Product cache (medium TTL)
  product: CacheFactory.getCache('product', {
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 1000,
    persist: true
  }),

  // Session cache (short TTL)
  session: CacheFactory.getCache('session', {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 200,
    persist: false
  }),

  // API response cache (medium TTL)
  api: CacheFactory.getCache('api', {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 300,
    persist: false
  }),

  // UI state cache (very short TTL)
  ui: CacheFactory.getCache('ui', {
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 100,
    persist: false
  })
}

// Export the main cache class and factory
export { EnhancedCache as Cache }
export default EnhancedCache 
