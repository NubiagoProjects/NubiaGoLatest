// ============================================================================
// RATE LIMITER UTILITY - Security & Performance
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  async checkLimit(
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<{
    success: boolean
    count: number
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const now = Date.now()
    const resetTime = now + windowMs
    
    let entry = this.store.get(key)
    
    // Create new entry if doesn't exist or expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime,
        blocked: false
      }
    }

    // Increment count
    entry.count++
    
    // Check if limit exceeded
    const success = entry.count <= maxRequests
    const remaining = Math.max(0, maxRequests - entry.count)
    
    // Update blocked status
    entry.blocked = !success
    
    // Store updated entry
    this.store.set(key, entry)
    
    return {
      success,
      count: entry.count,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: success ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    }
  }

  isBlocked(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now > entry.resetTime) {
      this.store.delete(key)
      return false
    }
    
    return entry.blocked
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  resetAll(): void {
    this.store.clear()
  }

  getStats() {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        resetTime: entry.resetTime,
        blocked: entry.blocked,
        timeRemaining: Math.max(0, entry.resetTime - Date.now())
      }))
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Main rate limit function
export async function rateLimit(
  key: string, 
  maxRequests: number, 
  windowMs: number
) {
  return await rateLimiter.checkLimit(key, maxRequests, windowMs)
}

// Convenience functions for common use cases
export const authRateLimit = (ip: string) => 
  rateLimit(`auth:${ip}`, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes

export const apiRateLimit = (ip: string) => 
  rateLimit(`api:${ip}`, 100, 60 * 1000) // 100 requests per minute

export const searchRateLimit = (ip: string) => 
  rateLimit(`search:${ip}`, 30, 60 * 1000) // 30 searches per minute

export const emailRateLimit = (email: string) => 
  rateLimit(`email:${email}`, 3, 60 * 60 * 1000) // 3 emails per hour

// Export utilities
export { rateLimiter }
