'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface OAuthButtonsProps {
  mode: 'login' | 'register'
  onError?: (error: string) => void
  onSuccess?: () => void
  disabled?: boolean
  className?: string
}

// Helper component for popup error guidance
function PopupErrorGuidance({ errorCode }: { errorCode: string }) {
  const getGuidance = () => {
    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        return {
          title: 'Popup was closed',
          message: 'The sign-in popup was closed before completion.',
          tips: [
            'Keep the popup window open until sign-in is complete',
            'Don\'t close the popup manually',
            'Try again or use email/password sign-in instead'
          ]
        }
      case 'auth/popup-blocked':
        return {
          title: 'Popup was blocked',
          message: 'Your browser blocked the sign-in popup.',
          tips: [
            'Allow popups for this website in your browser settings',
            'Check your browser\'s popup blocker settings',
            'Use email/password sign-in as an alternative'
          ]
        }
      case 'auth/cancelled-popup-request':
        return {
          title: 'Sign-in was cancelled',
          message: 'The sign-in process was cancelled.',
          tips: [
            'Make sure you complete the authorization process',
            'Don\'t navigate away from the popup',
            'Try again or use email/password sign-in'
          ]
        }
      default:
        return null
    }
  }

  const guidance = getGuidance()
  if (!guidance) return null

  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800">{guidance.title}</h4>
          <p className="text-sm text-amber-700 mt-1">{guidance.message}</p>
          <ul className="mt-2 space-y-1">
            {guidance.tips.map((tip, index) => (
              <li key={index} className="text-xs text-amber-600 flex items-center">
                <span className="w-1 h-1 bg-amber-400 rounded-full mr-2"></span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function OAuthButtons({ 
  mode, 
  onError, 
  onSuccess, 
  disabled = false,
  className = '' 
}: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null)
  const [retryCount, setRetryCount] = useState<{ google: number; facebook: number }>({ google: 0, facebook: 0 })
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null)
  const { signInWithGoogle } = useFirebaseAuth()
  const router = useRouter()

  const MAX_RETRIES = 2

  const handleGoogleAuth = async () => {
    if (disabled || loadingProvider) return
    
    setLoadingProvider('google')
    setLastError(null)
    setLastErrorCode(null)
    
    try {
      await signInWithGoogle()
      onSuccess?.()
      router.push('/customer')
      // Reset retry count on success
      setRetryCount(prev => ({ ...prev, google: 0 }))
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed'
      setLastError(errorMessage)
      setLastErrorCode(error.code || null)
      
      // Check if it's a popup-related error and we haven't exceeded retry limit
      if ((error.code === 'auth/popup-closed-by-user' || 
           error.code === 'auth/popup-blocked' || 
           error.code === 'auth/cancelled-popup-request') && 
          retryCount.google < MAX_RETRIES) {
        // Increment retry count
        setRetryCount(prev => ({ ...prev, google: prev.google + 1 }))
        // Don't show error immediately, let user retry
        setLastError(null)
        setLastErrorCode(null)
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleFacebookAuth = async () => {
    if (disabled || loadingProvider) return
    
    setLoadingProvider('facebook')
    setLastError(null)
    setLastErrorCode(null)
    
    try {
      // Facebook OAuth is not implemented yet - show user-friendly message
      const errorMessage = 'Facebook sign-in is temporarily unavailable. Please use Google sign-in or email/password instead.'
      setLastError(errorMessage)
      onError?.(errorMessage)
    } catch (error: any) {
      const errorMessage = error.message || 'Facebook sign-in failed'
      setLastError(errorMessage)
      setLastErrorCode(error.code || null)
      
      // Check if it's a popup-related error and we haven't exceeded retry limit
      if ((error.code === 'auth/popup-closed-by-user' || 
           error.code === 'auth/popup-blocked' || 
           error.code === 'auth/cancelled-popup-request') && 
          retryCount.facebook < MAX_RETRIES) {
        // Increment retry count
        setRetryCount(prev => ({ ...prev, facebook: prev.facebook + 1 }))
        // Don't show error immediately, let user retry
        setLastError(null)
        setLastErrorCode(null)
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setLoadingProvider(null)
    }
  }

  const isLoading = loadingProvider !== null || disabled

  // Helper function to get retry message
  const getRetryMessage = (provider: 'google' | 'facebook') => {
    const count = retryCount[provider]
    if (count === 0) return null
    if (count === 1) return 'Try again'
    if (count === 2) return 'Last attempt'
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Google Button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingProvider === 'google' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {loadingProvider !== 'google' && (
            <span className="ml-2">
              {mode === 'login' ? 'Sign in' : 'Sign up'} with Google
            </span>
          )}
        </button>
        
        {/* Retry message for Google */}
        {retryCount.google > 0 && retryCount.google <= MAX_RETRIES && (
          <div className="text-center">
            <p className="text-xs text-amber-600">
              {getRetryMessage('google')} • Popup closed unexpectedly
            </p>
          </div>
        )}
      </div>

      {/* Facebook Button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleFacebookAuth}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingProvider === 'facebook' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          {loadingProvider !== 'facebook' && (
            <span className="ml-2">
              {mode === 'login' ? 'Sign in' : 'Sign up'} with Facebook
            </span>
          )}
        </button>
        
        {/* Retry message for Facebook */}
        {retryCount.facebook > 0 && retryCount.facebook <= MAX_RETRIES && (
          <div className="text-center">
            <p className="text-xs text-amber-600">
              {getRetryMessage('facebook')} • Popup closed unexpectedly
            </p>
          </div>
        )}
      </div>

      {/* Popup error guidance */}
      {lastErrorCode && (
        <PopupErrorGuidance errorCode={lastErrorCode} />
      )}

      {/* General error message */}
      {lastError && (
        <div className="text-center">
          <p className="text-xs text-red-600">
            {lastError}
          </p>
        </div>
      )}
    </div>
  )
}

// Individual button components for more flexibility
export function GoogleAuthButton({ 
  mode, 
  onError, 
  onSuccess, 
  disabled = false,
  className = '',
  fullWidth = true 
}: OAuthButtonsProps & { fullWidth?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null)
  const { signInWithGoogle } = useFirebaseAuth()
  const router = useRouter()

  const MAX_RETRIES = 2

  const handleClick = async () => {
    if (disabled || loading) return
    
    setLoading(true)
    setLastError(null)
    setLastErrorCode(null)
    
    try {
      await signInWithGoogle()
      onSuccess?.()
      router.push('/customer')
      // Reset retry count on success
      setRetryCount(0)
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed'
      setLastError(errorMessage)
      setLastErrorCode(error.code || null)
      
      // Check if it's a popup-related error and we haven't exceeded retry limit
      if ((error.code === 'auth/popup-closed-by-user' || 
           error.code === 'auth/popup-blocked' || 
           error.code === 'auth/cancelled-popup-request') && 
          retryCount < MAX_RETRIES) {
        // Increment retry count
        setRetryCount(prev => prev + 1)
        // Don't show error immediately, let user retry
        setLastError(null)
        setLastErrorCode(null)
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const getRetryMessage = () => {
    if (retryCount === 0) return null
    if (retryCount === 1) return 'Try again'
    if (retryCount === 2) return 'Last attempt'
    return null
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path 
              fill="#EA4335" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {!loading && (
          <span className="ml-2">
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Google
          </span>
        )}
      </button>
      
      {/* Retry message */}
      {retryCount > 0 && retryCount <= MAX_RETRIES && (
        <div className="text-center">
          <p className="text-xs text-amber-600">
            {getRetryMessage()} • Popup closed unexpectedly
          </p>
        </div>
      )}
      
      {/* Popup error guidance */}
      {lastErrorCode && (
        <PopupErrorGuidance errorCode={lastErrorCode} />
      )}
      
      {/* Error message */}
      {lastError && (
        <div className="text-center">
          <p className="text-xs text-red-600">
            {lastError}
          </p>
        </div>
      )}
    </div>
  )
}

export function FacebookAuthButton({ 
  mode, 
  onError, 
  onSuccess, 
  disabled = false,
  className = '',
  fullWidth = true 
}: OAuthButtonsProps & { fullWidth?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null)
  const { signIn } = useFirebaseAuth()
  const router = useRouter()

  const MAX_RETRIES = 2

  const handleClick = async () => {
    if (disabled || loading) return
    
    setLoading(true)
    setLastError(null)
    setLastErrorCode(null)
    
    try {
      // Facebook OAuth is not implemented yet - show user-friendly message
      const errorMessage = 'Facebook sign-in is temporarily unavailable. Please use Google sign-in or email/password instead.'
      setLastError(errorMessage)
      throw new Error(errorMessage)
    } catch (error: any) {
      const errorMessage = error.message || 'Facebook sign-in failed'
      setLastError(errorMessage)
      setLastErrorCode(error.code || null)
      
      // Check if it's a popup-related error and we haven't exceeded retry limit
      if ((error.code === 'auth/popup-closed-by-user' || 
           error.code === 'auth/popup-blocked' || 
           error.code === 'auth/cancelled-popup-request') && 
          retryCount < MAX_RETRIES) {
        // Increment retry count
        setRetryCount(prev => prev + 1)
        // Don't show error immediately, let user retry
        setLastError(null)
        setLastErrorCode(null)
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const getRetryMessage = () => {
    if (retryCount === 0) return null
    if (retryCount === 1) return 'Try again'
    if (retryCount === 2) return 'Last attempt'
    return null
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )}
        {!loading && (
          <span className="ml-2">
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Facebook
          </span>
        )}
      </button>
      
      {/* Retry message */}
      {retryCount > 0 && retryCount <= MAX_RETRIES && (
        <div className="text-center">
          <p className="text-xs text-amber-600">
            {getRetryMessage()} • Popup closed unexpectedly
          </p>
        </div>
      )}
      
      {/* Popup error guidance */}
      {lastErrorCode && (
        <PopupErrorGuidance errorCode={lastErrorCode} />
      )}
      
      {/* Error message */}
      {lastError && (
        <div className="text-center">
          <p className="text-xs text-red-600">
            {lastError}
          </p>
        </div>
      )}
    </div>
  )
}
