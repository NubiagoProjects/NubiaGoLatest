import { NextRequest, NextResponse } from 'next/server'
import { JWTVerifier } from '@/lib/auth/jwt-verifier'
import { EdgeUserService } from '@/lib/services/edge-user.service'
import { CSRFProtection, getCSRFTokenFromRequest, getSessionTokenFromRequest } from '@/lib/security/csrf'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string
    email: string
    role: string
    status: string
    displayName?: string | null
    emailVerified?: boolean
  }
}

export interface RoleGuard {
  roles?: string[]
  requireActive?: boolean
  requireEmailVerified?: boolean
}

/**
 * Middleware to authenticate API requests
 */
export async function authenticateAPI(
  request: NextRequest,
  roleGuard?: RoleGuard
): Promise<AuthenticatedRequest | NextResponse> {
  try {
    // Get JWT token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const verificationResult = await JWTVerifier.verifyToken(token)
    
    if (!verificationResult.valid || !verificationResult.payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }

    // Extract basic user data from JWT
    const jwtUserData = JWTVerifier.extractUserData(verificationResult.payload)
    
    // Try to get additional user data from Firestore (may fail in Edge Runtime)
    let userData = null
    try {
      userData = await EdgeUserService.getUserData(jwtUserData.uid)
    } catch (error) {
      console.warn('Could not fetch user data from Firestore in Edge Runtime:', error)
    }
    
    // If we can't get Firestore data, use JWT data with defaults
    if (!userData) {
      userData = {
        uid: jwtUserData.uid,
        email: jwtUserData.email,
        displayName: undefined,
        role: 'customer' as const, // Default role
        status: 'active' as const, // Default status
        emailVerified: jwtUserData.emailVerified
      }
    }

    const user = {
      uid: userData.uid,
      email: userData.email,
      role: userData.role || 'customer',
      status: userData.status || 'pending',
      displayName: userData.displayName || undefined,
      emailVerified: userData.emailVerified
    }

    // Check if user is active (if required)
    if (roleGuard?.requireActive !== false && !EdgeUserService.isUserActive(userData)) {
      return NextResponse.json(
        { error: 'Account is not active', code: 'ACCOUNT_INACTIVE' },
        { status: 403 }
      )
    }

    // Check if email is verified (if required)
    if (roleGuard?.requireEmailVerified && !userData.emailVerified) {
      return NextResponse.json(
        { error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      )
    }

    // Check role permissions (if specified)
    if (roleGuard?.roles && !EdgeUserService.hasRequiredRole(userData, roleGuard.roles)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      )
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return authenticatedRequest
  } catch (error) {
    console.error('API authentication error:', error)
    
    return NextResponse.json(
      { error: 'Authentication failed', code: 'AUTH_FAILED' },
      { status: 401 }
    )
  }
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(roleGuard?: RoleGuard) {
  return function(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
    return async function(request: NextRequest): Promise<NextResponse> {
      // Handle build-time requests
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        // Create a mock authenticated request for build time
        const mockRequest = request as AuthenticatedRequest
        mockRequest.user = {
          uid: 'build-time-user',
          email: 'build@time.com',
          role: 'admin',
          status: 'active',
          displayName: 'Build System',
          emailVerified: true
        }
        return handler(mockRequest)
      }

      const authResult = await authenticateAPI(request, roleGuard)
      
      if (authResult instanceof NextResponse) {
        return authResult
      }

      return handler(authResult)
    }
  }
}

/**
 * Admin-only API protection
 */
export const withAdminAuth = withAuth({
  roles: ['admin'],
  requireActive: true,
  requireEmailVerified: true
})

/**
 * Supplier-only API protection
 */
export const withSupplierAuth = withAuth({
  roles: ['supplier'],
  requireActive: true,
  requireEmailVerified: true
})

/**
 * Customer-only API protection
 */
export const withCustomerAuth = withAuth({
  roles: ['customer'],
  requireActive: true,
  requireEmailVerified: true
})

/**
 * Rate limiting middleware
 */
export function withRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return function(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
    return async function(request: AuthenticatedRequest): Promise<NextResponse> {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      const now = Date.now()
      
      const userRequests = requests.get(ip)
      
      if (!userRequests || now > userRequests.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs })
      } else if (userRequests.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
          { status: 429 }
        )
      } else {
        userRequests.count++
      }

      return handler(request)
    }
  }
}

/**
 * CSRF protection middleware
 */
export function withCSRFProtection(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async function(request: AuthenticatedRequest): Promise<NextResponse> {
    // Only apply to state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = getCSRFTokenFromRequest(request)
      const sessionToken = getSessionTokenFromRequest(request)
      
      if (!csrfToken || !sessionToken) {
        return NextResponse.json(
          { error: 'CSRF token required', code: 'CSRF_REQUIRED' },
          { status: 403 }
        )
      }

      // Validate CSRF token
      const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'fallback-secret'
      const isValidToken = CSRFProtection.validateSignedToken(csrfToken, sessionToken, secret)
      
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Invalid CSRF token', code: 'INVALID_CSRF_TOKEN' },
          { status: 403 }
        )
      }
    }

    return handler(request)
  }
}

/**
 * Request logging middleware
 */
export function withRequestLogging(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async function(request: AuthenticatedRequest): Promise<NextResponse> {
    const startTime = Date.now()
    const method = request.method
    const url = request.url
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${ip} - ${userAgent}`)

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      
      console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} - ${duration}ms`)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[${new Date().toISOString()}] ${method} ${url} - ERROR - ${duration}ms:`, error)
      throw error
    }
  }
}

/**
 * Error handling middleware
 */
export function withErrorHandling(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async function(request: AuthenticatedRequest): Promise<NextResponse> {
    try {
      return await handler(request)
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      const errorMessage = isDevelopment ? error.message : 'Internal server error'
      const errorCode = isDevelopment ? error.code || 'INTERNAL_ERROR' : 'INTERNAL_ERROR'
      
      return NextResponse.json(
        { error: errorMessage, code: errorCode },
        { status: 500 }
      )
    }
  }
}

/**
 * Combined middleware for common API protection
 */
export function protectAPI(
  roleGuard?: RoleGuard,
  options: {
    rateLimit?: number
    enableCSRF?: boolean
    enableLogging?: boolean
  } = {}
) {
  return function(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
    let protectedHandler = handler

    // Apply CSRF protection if enabled
    if (options.enableCSRF !== false) {
      protectedHandler = withCSRFProtection(protectedHandler)
    }

    // Apply rate limiting if specified
    if (options.rateLimit) {
      protectedHandler = withRateLimit(options.rateLimit)(protectedHandler)
    }

    // Apply request logging if enabled
    if (options.enableLogging) {
      protectedHandler = withRequestLogging(protectedHandler)
    }

    // Apply authentication and role checking
    protectedHandler = withAuth(roleGuard)(protectedHandler)

    // Apply error handling
    protectedHandler = withErrorHandling(protectedHandler)

    return protectedHandler
  }
}

/**
 * Admin API protection with full security
 */
export const protectAdminAPI = protectAPI(
  { roles: ['admin'], requireActive: true, requireEmailVerified: true },
  { enableCSRF: true, rateLimit: 50, enableLogging: true }
)

/**
 * Supplier API protection with full security
 */
export const protectSupplierAPI = protectAPI(
  { roles: ['supplier'], requireActive: true, requireEmailVerified: true },
  { enableCSRF: true, rateLimit: 100, enableLogging: true }
)

/**
 * Customer API protection with full security
 */
export const protectCustomerAPI = protectAPI(
  { roles: ['customer'], requireActive: true, requireEmailVerified: true },
  { enableCSRF: true, rateLimit: 200, enableLogging: true }
) 
