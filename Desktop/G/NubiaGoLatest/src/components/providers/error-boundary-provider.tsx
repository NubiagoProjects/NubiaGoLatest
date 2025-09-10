'use client'

import React from 'react'
import { ErrorBoundary, DataFetchingErrorBoundary, FormErrorBoundary, AuthErrorBoundary, PaymentErrorBoundary, MediaErrorBoundary } from '@/components/ui/error-boundary'
import { logger } from '@/lib/utils/logger'

interface ErrorBoundaryProviderProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Global error boundary provider that wraps the entire application
 * Provides different error boundaries for different types of components
 */
export function ErrorBoundaryProvider({ children, onError }: ErrorBoundaryProviderProps) {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error using the logger
    logger.error('Global error boundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Log to external monitoring service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      try {
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack
              }
            },
            tags: {
              errorBoundary: 'global',
              errorType: 'global'
            }
          })
        }
      } catch (logError) {
        logger.error('Failed to log error to Sentry:', logError)
      }
    }
  }

  return (
    <ErrorBoundary
      onError={handleGlobalError}
      errorMessage="A critical error occurred. Please refresh the page or contact support if the problem persists."
      showResetButton={true}
      showHomeButton={true}
      showBackButton={true}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook to get the appropriate error boundary based on component type
 */
export function useErrorBoundary() {
  return {
    DataFetchingErrorBoundary,
    FormErrorBoundary,
    AuthErrorBoundary,
    PaymentErrorBoundary,
    MediaErrorBoundary,
    ErrorBoundary
  }
}

/**
 * Higher-order component to wrap components with appropriate error boundaries
 */
export function withAppropriateErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryType: 'data' | 'form' | 'auth' | 'payment' | 'media' | 'general' = 'general'
) {
  const WrappedComponent = (props: P) => {
    const boundaries = {
      data: DataFetchingErrorBoundary,
      form: FormErrorBoundary,
      auth: AuthErrorBoundary,
      payment: PaymentErrorBoundary,
      media: MediaErrorBoundary,
      general: ErrorBoundary
    }

    const Boundary = boundaries[boundaryType]

    return (
      <Boundary>
        <Component {...props} />
      </Boundary>
    )
  }

  WrappedComponent.displayName = `with${boundaryType.charAt(0).toUpperCase() + boundaryType.slice(1)}ErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}
