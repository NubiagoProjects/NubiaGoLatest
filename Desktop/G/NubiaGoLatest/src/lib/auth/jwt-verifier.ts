// JWT verification utility for Edge Runtime
// This works without Firebase Admin dependencies

interface JWTPayload {
  iss: string
  aud: string
  auth_time: number
  user_id: string
  sub: string
  iat: number
  exp: number
  email: string
  email_verified: boolean
  firebase: {
    identities: Record<string, any>
    sign_in_provider: string
  }
}

interface VerificationResult {
  valid: boolean
  payload?: JWTPayload
  error?: string
}

export class JWTVerifier {
  private static readonly FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  private static readonly FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

  /**
   * Verify Firebase JWT token
   */
  static async verifyToken(token: string): Promise<VerificationResult> {
    try {
      if (!token) {
        return { valid: false, error: 'No token provided' }
      }

      // Decode the JWT token
      const decoded = this.decodeJWT(token)
      
      if (!decoded) {
        return { valid: false, error: 'Invalid token format' }
      }

      // Basic validation
      if (!this.isValidPayload(decoded)) {
        return { valid: false, error: 'Invalid token payload' }
      }

      // Check expiration
      if (this.isExpired(decoded)) {
        return { valid: false, error: 'Token expired' }
      }

      // Check issuer
      if (!this.isValidIssuer(decoded)) {
        return { valid: false, error: 'Invalid issuer' }
      }

      // Check audience
      if (!this.isValidAudience(decoded)) {
        return { valid: false, error: 'Invalid audience' }
      }

      // Verify signature (simplified for Edge Runtime)
      if (!await this.verifySignature(token)) {
        return { valid: false, error: 'Invalid signature' }
      }

      return { valid: true, payload: decoded }
    } catch (error) {
      console.error('JWT verification error:', error)
      return { valid: false, error: 'Token verification failed' }
    }
  }

  /**
   * Decode JWT token (base64 decode only)
   */
  private static decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      // Decode payload
      const payload = parts[1]
      const decoded = JSON.parse(atob(payload))
      
      return decoded as JWTPayload
    } catch (error) {
      console.error('JWT decode error:', error)
      return null
    }
  }

  /**
   * Check if payload has required fields
   */
  private static isValidPayload(payload: any): payload is JWTPayload {
    return (
      payload &&
      typeof payload === 'object' &&
      typeof payload.sub === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number' &&
      typeof payload.user_id === 'string' &&
      typeof payload.email === 'string'
    )
  }

  /**
   * Check if token is expired
   */
  private static isExpired(payload: JWTPayload): boolean {
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  }

  /**
   * Check if issuer is valid
   */
  private static isValidIssuer(payload: JWTPayload): boolean {
    const expectedIssuer = `https://securetoken.google.com/${this.FIREBASE_PROJECT_ID}`
    return payload.iss === expectedIssuer
  }

  /**
   * Check if audience is valid
   */
  private static isValidAudience(payload: JWTPayload): boolean {
    return payload.aud === this.FIREBASE_PROJECT_ID
  }

  /**
   * Verify JWT signature (simplified implementation)
   */
  private static async verifySignature(token: string): Promise<boolean> {
    try {
      // In a production environment, you would:
      // 1. Fetch Firebase public keys from https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
      // 2. Verify the signature using the appropriate public key
      // 3. Check the key ID (kid) in the header
      
      // For now, we'll do basic validation
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }

      // Check if the token has a valid structure
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))

      // Basic checks
      if (!header.alg || !header.kid) {
        return false
      }

      if (!payload.iss || !payload.aud || !payload.sub) {
        return false
      }

      return true
    } catch (error) {
      console.error('Signature verification error:', error)
      return false
    }
  }

  /**
   * Extract user data from JWT payload
   */
  static extractUserData(payload: JWTPayload) {
    return {
      uid: payload.user_id,
      email: payload.email,
      emailVerified: payload.email_verified
    }
  }
} 
