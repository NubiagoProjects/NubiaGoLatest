'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { logger } from '@/lib/utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  errorMessage?: string
  showResetButton?: boolean
  showHomeButton?: boolean
  showBackButton?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error | string | any): State {
    // Convert non-Error objects to Error objects for consistent handling
    const normalizedError = error instanceof Error ? error : new Error(String(error))
    
    return {
      hasError: true,
      error: normalizedError,
      errorInfo: null,
      errorId: ErrorBoundary.generateErrorId()
    }
  }

  componentDidCatch(error: Error | string | any, errorInfo: ErrorInfo) {
    // Normalize error to Error object for consistent handling
    const normalizedError = error instanceof Error ? error : new Error(String(error))
    
    // Log error using logger instead of console
    logger.error('ErrorBoundary caught an error:', normalizedError, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(normalizedError, errorInfo)
    }

    // Log error to external service (e.g., Sentry)
    this.logErrorToService(normalizedError, errorInfo)

    // Update state with error info
    this.setState({
      error: normalizedError,
      errorInfo
    })
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when props change (useful for route changes)
    if (this.props.resetOnPropsChange && prevProps !== this.props) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
    }
  }

  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // Log to Sentry if available
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack
            }
          },
          tags: {
            errorBoundary: 'true',
            errorId: this.state.errorId
          }
        })
      }

      // Log to custom error service
      this.logToCustomService(error, errorInfo)
    } catch (logError) {
      logger.error('Failed to log error to service:', logError)
    }
  }

  private logToCustomService(error: Error, errorInfo: ErrorInfo) {
    // Send error to your backend logging service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/log/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          },
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: window.location.href
        })
      }).catch((error) => logger.error('Failed to send error to logging service:', error))
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  private goHome = () => {
    window.location.href = '/'
  }

  private goBack = () => {
    window.history.back()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              {this.props.errorMessage || 'Something went wrong'}
            </h1>
            
            {/* Display actual error message prominently */}
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Error Details:
                </p>
                <p className="text-sm text-red-700">
                  {this.state.error.message || this.state.error.toString()}
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto">
                  {this.state.errorInfo && (
                    <div className="mb-2">
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorId && (
                    <div className="mt-2">
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.showResetButton !== false && (
                <Button
                  onClick={this.resetError}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}

              {this.props.showBackButton && (
                <Button
                  onClick={this.goBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              )}

              {this.props.showHomeButton !== false && (
                <Button
                  onClick={this.goHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              )}
            </div>

            {this.state.errorId && (
              <p className="text-xs text-gray-500 mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for functional components to handle errors
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    logger.error('Error caught by useErrorHandler:', error)
    setError(error)

    // Log to external service
    if (process.env.NODE_ENV === 'production') {
      try {
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(error)
        }
      } catch (logError) {
        logger.error('Failed to log error:', logError)
      }
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  }
}

/**
 * Higher-order component for error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Error boundary for specific sections
 */
export function SectionErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Section Error</span>
          </div>
          <p className="text-sm text-red-700 mb-3">
            This section encountered an error. Please refresh the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            Refresh Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Async error boundary for async operations
 */
export function AsyncErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2 text-orange-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Async Operation Error</span>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            An async operation failed. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            Retry
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
} 

/**
 * Error boundary specifically for data fetching components
 */
export function DataFetchingErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-3 text-red-800 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Data Loading Error</span>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Failed to load data. Please check your connection and try again.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              onClick={() => window.history.back()}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Error boundary for form components
 */
export function FormErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2 text-orange-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Form Error</span>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            There was an error with the form. Please refresh and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Form
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Error boundary for authentication components
 */
export function AuthErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-3 text-red-800 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Authentication Error</span>
          </div>
          <p className="text-sm text-red-700 mb-4">
            An authentication error occurred. Please try logging in again.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.href = '/auth/login'}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Go to Login
            </Button>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Error boundary for payment/transaction components
 */
export function PaymentErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-3 text-red-800 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Payment Error</span>
          </div>
          <p className="text-sm text-red-700 mb-4">
            A payment error occurred. Please check your payment details and try again.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.history.back()}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Error boundary for image/media components
 */
export function MediaErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-gray-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Media Error</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Failed to load media content. Please refresh the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
} 
