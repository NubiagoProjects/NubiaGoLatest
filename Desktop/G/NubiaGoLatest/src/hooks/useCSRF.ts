import { useState, useEffect, useCallback } from 'react'
import { CSRFProtection } from '@/lib/security/csrf'

/**
 * Hook for managing CSRF tokens in React components
 */
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generate a new CSRF token
   */
  const generateToken = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get session token from cookies or localStorage
      const sessionToken = getSessionToken()
      
      if (!sessionToken) {
        throw new Error('No session token found')
      }

      // Generate CSRF token
      const secret = process.env.NEXT_PUBLIC_CSRF_SECRET || 'fallback-secret'
      const tokenData = CSRFProtection.generateToken(sessionToken, secret)
      const signedToken = CSRFProtection.generateSignedToken(sessionToken, secret)

      // Store token in localStorage with expiry
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('csrf-token', signedToken)
          localStorage.setItem('csrf-expires', tokenData.expiresAt.toString())
        } catch (error) {
          console.warn('Failed to store CSRF token in localStorage:', error)
        }
      }

      setCsrfToken(signedToken)
      return signedToken
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate CSRF token'
      setError(errorMessage)
      console.error('CSRF token generation error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Validate current CSRF token
   */
  const validateToken = useCallback((token: string): boolean => {
    try {
      const sessionToken = getSessionToken()
      if (!sessionToken || !token) return false

      const secret = process.env.NEXT_PUBLIC_CSRF_SECRET || 'fallback-secret'
      return CSRFProtection.validateSignedToken(token, sessionToken, secret)
    } catch (err) {
      console.error('CSRF token validation error:', err)
      return false
    }
  }, [])

  /**
   * Refresh CSRF token if expired
   */
  const refreshTokenIfNeeded = useCallback(async (): Promise<string | null> => {
    try {
      let storedToken: string | null = null
      let expiresAt: string | null = null
      
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          storedToken = localStorage.getItem('csrf-token')
          expiresAt = localStorage.getItem('csrf-expires')
        } catch (error) {
          console.warn('Failed to read CSRF token from localStorage:', error)
        }
      }

      if (!storedToken || !expiresAt) {
        return await generateToken()
      }

      const isExpired = CSRFProtection.isTokenExpired(parseInt(expiresAt))
      
      if (isExpired) {
        console.log('CSRF token expired, generating new one')
        return await generateToken()
      }

      // Validate existing token
      if (validateToken(storedToken)) {
        setCsrfToken(storedToken)
        return storedToken
      } else {
        console.log('Stored CSRF token invalid, generating new one')
        return await generateToken()
      }
    } catch (err) {
      console.error('Error refreshing CSRF token:', err)
      return await generateToken()
    }
  }, [generateToken, validateToken])

  /**
   * Get CSRF token for API requests
   */
  const getTokenForRequest = useCallback(async (): Promise<string | null> => {
    if (!csrfToken) {
      return await refreshTokenIfNeeded()
    }

    if (validateToken(csrfToken)) {
      return csrfToken
    }

    return await refreshTokenIfNeeded()
  }, [csrfToken, refreshTokenIfNeeded, validateToken])

  /**
   * Clear CSRF token
   */
  const clearToken = useCallback(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('csrf-token')
        localStorage.removeItem('csrf-expires')
      } catch (error) {
        console.warn('Failed to clear CSRF token from localStorage:', error)
      }
    }
    setCsrfToken(null)
  }, [])

  // Initialize CSRF token on mount
  useEffect(() => {
    refreshTokenIfNeeded()
  }, [refreshTokenIfNeeded])

  // Set up periodic token refresh (every 12 hours)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTokenIfNeeded()
    }, 12 * 60 * 60 * 1000) // 12 hours

    return () => clearInterval(interval)
  }, [refreshTokenIfNeeded])

  return {
    csrfToken,
    isLoading,
    error,
    generateToken,
    validateToken,
    refreshTokenIfNeeded,
    getTokenForRequest,
    clearToken
  }
}

/**
 * Get session token from cookies or localStorage
 */
function getSessionToken(): string | null {
  // Try to get from cookies first
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    if (cookies['session']) return cookies['session']
    if (cookies['auth-token']) return cookies['auth-token']
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem('session-token') || 
             localStorage.getItem('auth-token')
    } catch (error) {
      console.warn('Failed to read session token from localStorage:', error)
      return null
    }
  }

  return null
}

/**
 * Hook for adding CSRF token to fetch requests
 */
export function useCSRFFetch() {
  const { getTokenForRequest } = useCSRF()

  const fetchWithCSRF = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    try {
      const csrfToken = await getTokenForRequest()
      
      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'x-csrf-token': csrfToken
        }
      }

      return fetch(url, options)
    } catch (error) {
      console.error('Error adding CSRF token to request:', error)
      // Continue without CSRF token if there's an error
      return fetch(url, options)
    }
  }, [getTokenForRequest])

  return { fetchWithCSRF }
}

/**
 * Hook for forms that need CSRF protection
 */
export function useCSRFForm() {
  const { csrfToken, isLoading, error } = useCSRF()

  const getFormProps = useCallback(() => ({
    'data-csrf-token': csrfToken,
    'data-csrf-loading': isLoading,
    'data-csrf-error': error
  }), [csrfToken, isLoading, error])

  return {
    csrfToken,
    isLoading,
    error,
    getFormProps
  }
}
