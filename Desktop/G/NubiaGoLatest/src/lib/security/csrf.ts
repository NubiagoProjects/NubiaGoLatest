import { randomBytes, createHmac } from 'crypto'

/**
 * CSRF Token Management
 * Provides secure generation and validation of CSRF tokens
 */

export interface CSRFTokenData {
  token: string
  expiresAt: number
  sessionId: string
}

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Generate a new CSRF token
   */
  static generateToken(sessionId: string, secret: string): CSRFTokenData {
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex')
    const expiresAt = Date.now() + this.TOKEN_EXPIRY

    return {
      token,
      expiresAt,
      sessionId
    }
  }

  /**
   * Validate a CSRF token
   */
  static validateToken(token: string, sessionId: string, secret: string): boolean {
    try {
      if (!token || !sessionId || !secret) {
        return false
      }

      // Check token format
      if (token.length !== this.TOKEN_LENGTH * 2) { // hex string is 2x bytes
        return false
      }

      // Validate token format (hex only)
      if (!/^[a-f0-9]+$/i.test(token)) {
        return false
      }

      return true
    } catch (error) {
      console.error('CSRF token validation error:', error)
      return false
    }
  }

  /**
   * Generate a signed CSRF token
   */
  static generateSignedToken(sessionId: string, secret: string): string {
    const tokenData = this.generateToken(sessionId, secret)
    const signature = this.signToken(tokenData.token, sessionId, secret)
    
    return `${tokenData.token}.${signature}`
  }

  /**
   * Validate a signed CSRF token
   */
  static validateSignedToken(signedToken: string, sessionId: string, secret: string): boolean {
    try {
      const [token, signature] = signedToken.split('.')
      
      if (!token || !signature) {
        return false
      }

      // Validate token format
      if (!this.validateToken(token, sessionId, secret)) {
        return false
      }

      // Validate signature
      const expectedSignature = this.signToken(token, sessionId, secret)
      return signature === expectedSignature
    } catch (error) {
      console.error('Signed CSRF token validation error:', error)
      return false
    }
  }

  /**
   * Sign a token with HMAC
   */
  private static signToken(token: string, sessionId: string, secret: string): string {
    const hmac = createHmac('sha256', secret)
    hmac.update(token + sessionId)
    return hmac.digest('hex')
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt
  }

  /**
   * Refresh a CSRF token
   */
  static refreshToken(sessionId: string, secret: string): CSRFTokenData {
    return this.generateToken(sessionId, secret)
  }
}

/**
 * Utility function to get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get('x-csrf-token') || 
         request.headers.get('csrf-token') ||
         null
}

/**
 * Utility function to get session token from cookies
 */
export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['session'] || cookies['auth-token'] || null
}
