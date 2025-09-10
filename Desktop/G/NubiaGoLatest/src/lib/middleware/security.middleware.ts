import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/utils/rate-limiter'
import { validateInput } from '@/lib/utils/input-validator'
import { logger } from '@/lib/utils/logger'

// ============================================================================
// SECURITY MIDDLEWARE - Enhanced Security Measures
// ============================================================================

export interface SecurityConfig {
  enableRateLimit: boolean
  enableInputValidation: boolean
  enableCSRFProtection: boolean
  enableXSSProtection: boolean
  enableSQLInjectionProtection: boolean
  maxRequestSize: number
  allowedOrigins: string[]
  blockedIPs: string[]
}

export interface SecurityContext {
  ip: string
  userAgent: string
  origin: string
  path: string
  method: string
  timestamp: number
}

export class SecurityMiddleware {
  private config: SecurityConfig
  private suspiciousActivities = new Map<string, number>()
  private blockedIPs = new Set<string>()

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      enableRateLimit: true,
      enableInputValidation: true,
      enableCSRFProtection: true,
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'https://nubiago.com',
        'https://www.nubiago.com'
      ],
      blockedIPs: [],
      ...config
    }

    // Initialize blocked IPs
    this.config.blockedIPs.forEach(ip => this.blockedIPs.add(ip))
  }

  async processRequest(request: NextRequest): Promise<NextResponse | null> {
    const context = this.extractSecurityContext(request)

    try {
      // 1. IP Blocking Check
      if (this.isIPBlocked(context.ip)) {
        logger.warn(`Blocked request from IP: ${context.ip}`)
        return new NextResponse('Forbidden', { status: 403 })
      }

      // 2. Rate Limiting
      if (this.config.enableRateLimit) {
        const rateLimitResult = await this.checkRateLimit(context)
        if (!rateLimitResult.allowed) {
          logger.warn(`Rate limit exceeded for IP: ${context.ip}`)
          return new NextResponse('Too Many Requests', { 
            status: 429,
            headers: {
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
            }
          })
        }
      }

      // 3. CORS Check
      const corsResult = this.checkCORS(context)
      if (!corsResult.allowed) {
        logger.warn(`CORS violation from origin: ${context.origin}`)
        return new NextResponse('Forbidden', { status: 403 })
      }

      // 4. Request Size Check
      const sizeResult = await this.checkRequestSize(request)
      if (!sizeResult.allowed) {
        logger.warn(`Request size exceeded limit: ${sizeResult.size}`)
        return new NextResponse('Payload Too Large', { status: 413 })
      }

      // 5. Input Validation (for POST/PUT requests)
      if (['POST', 'PUT', 'PATCH'].includes(context.method)) {
        const validationResult = await this.validateRequestInput(request)
        if (!validationResult.valid) {
          logger.warn(`Invalid input detected: ${validationResult.errors.join(', ')}`)
          return new NextResponse('Bad Request', { status: 400 })
        }
      }

      // 6. Suspicious Activity Detection
      this.detectSuspiciousActivity(context)

      return null // Allow request to continue
    } catch (error) {
      logger.error('Security middleware error:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }

  private extractSecurityContext(request: NextRequest): SecurityContext {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIP || request.ip || 'unknown'

    return {
      ip,
      userAgent: request.headers.get('user-agent') || '',
      origin: request.headers.get('origin') || '',
      path: request.nextUrl.pathname,
      method: request.method,
      timestamp: Date.now()
    }
  }

  private isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }

  private async checkRateLimit(context: SecurityContext): Promise<{
    allowed: boolean
    retryAfter?: number
  }> {
    // Different rate limits for different endpoints
    const limits = {
      '/api/auth/login': { requests: 5, window: 15 * 60 * 1000 }, // 5 per 15 min
      '/api/auth/register': { requests: 3, window: 60 * 60 * 1000 }, // 3 per hour
      '/api/auth/verify-email': { requests: 10, window: 60 * 60 * 1000 }, // 10 per hour
      '/api/products': { requests: 100, window: 60 * 1000 }, // 100 per minute
      '/api/orders': { requests: 20, window: 60 * 1000 }, // 20 per minute
      default: { requests: 60, window: 60 * 1000 } // 60 per minute default
    }

    const pathKey = Object.keys(limits).find(path => 
      context.path.startsWith(path)
    ) || 'default'

    const limit = limits[pathKey as keyof typeof limits] || limits.default
    const key = `${context.ip}:${pathKey}`

    const result = await rateLimit(key, limit.requests, limit.window)
    
    return {
      allowed: result.success,
      retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : undefined
    }
  }

  private checkCORS(context: SecurityContext): { allowed: boolean } {
    if (!context.origin) return { allowed: true } // Same-origin requests

    const isAllowed = this.config.allowedOrigins.some(origin => {
      if (origin === '*') return true
      if (origin.endsWith('*')) {
        const baseOrigin = origin.slice(0, -1)
        return context.origin.startsWith(baseOrigin)
      }
      return context.origin === origin
    })

    return { allowed: isAllowed }
  }

  private async checkRequestSize(request: NextRequest): Promise<{
    allowed: boolean
    size: number
  }> {
    const contentLength = request.headers.get('content-length')
    const size = contentLength ? parseInt(contentLength, 10) : 0

    return {
      allowed: size <= this.config.maxRequestSize,
      size
    }
  }

  private async validateRequestInput(request: NextRequest): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        const body = await request.clone().json()
        
        // XSS Protection
        if (this.config.enableXSSProtection) {
          const xssErrors = this.detectXSS(body)
          errors.push(...xssErrors)
        }

        // SQL Injection Protection
        if (this.config.enableSQLInjectionProtection) {
          const sqlErrors = this.detectSQLInjection(body)
          errors.push(...sqlErrors)
        }

        // Input Validation
        if (this.config.enableInputValidation) {
          const validationErrors = validateInput(body, request.nextUrl.pathname)
          errors.push(...validationErrors)
        }
      }
    } catch (error) {
      errors.push('Invalid JSON format')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private detectXSS(data: any, path = ''): string[] {
    const errors: string[] = []
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ]

    const checkValue = (value: any, currentPath: string) => {
      if (typeof value === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(value)) {
            errors.push(`Potential XSS detected in ${currentPath}: ${pattern.source}`)
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          checkValue(val, `${currentPath}.${key}`)
        })
      }
    }

    checkValue(data, path || 'request')
    return errors
  }

  private detectSQLInjection(data: any, path = ''): string[] {
    const errors: string[] = []
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(;|\||&|\$|\+|'|"|`|<|>|\*|%|=)/g,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|ONCLICK)\b)/gi,
      /(\/\*|\*\/|--|\#)/g
    ]

    const checkValue = (value: any, currentPath: string) => {
      if (typeof value === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            errors.push(`Potential SQL injection detected in ${currentPath}: ${pattern.source}`)
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          checkValue(val, `${currentPath}.${key}`)
        })
      }
    }

    checkValue(data, path || 'request')
    return errors
  }

  private detectSuspiciousActivity(context: SecurityContext) {
    const suspiciousPatterns = [
      /\.\.\//g, // Directory traversal
      /\/etc\/passwd/g, // System file access
      /\/proc\//g, // Process information
      /cmd\.exe/g, // Windows command execution
      /powershell/g, // PowerShell execution
      /base64/g, // Base64 encoding (potential payload)
    ]

    let suspiciousScore = 0

    // Check path for suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(context.path)) {
        suspiciousScore += 10
      }
    }

    // Check user agent
    if (!context.userAgent || context.userAgent.length < 10) {
      suspiciousScore += 5
    }

    // Check for rapid requests
    const currentActivity = this.suspiciousActivities.get(context.ip) || 0
    this.suspiciousActivities.set(context.ip, currentActivity + 1)

    if (currentActivity > 100) { // More than 100 requests tracked
      suspiciousScore += 20
    }

    // Block IP if suspicious score is too high
    if (suspiciousScore >= 30) {
      this.blockIP(context.ip, 'Suspicious activity detected')
    }

    // Clean up old activity records
    setTimeout(() => {
      this.suspiciousActivities.delete(context.ip)
    }, 60 * 1000) // Clean up after 1 minute
  }

  public blockIP(ip: string, reason: string) {
    this.blockedIPs.add(ip)
    logger.warn(`IP blocked: ${ip}, Reason: ${reason}`)
    
    // In production, you might want to persist this to a database
    // or send to a security monitoring service
  }

  public unblockIP(ip: string) {
    this.blockedIPs.delete(ip)
    logger.info(`IP unblocked: ${ip}`)
  }

  public getSecurityStats() {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousActivities: Object.fromEntries(this.suspiciousActivities),
      config: this.config
    }
  }

  public updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export singleton instance
export const securityMiddleware = new SecurityMiddleware()

// Helper function for Next.js middleware
export function createSecurityMiddleware(config?: Partial<SecurityConfig>) {
  const middleware = new SecurityMiddleware(config)
  
  return async (request: NextRequest) => {
    return await middleware.processRequest(request)
  }
}
