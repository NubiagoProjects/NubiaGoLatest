/**
 * Enhanced Error Boundary System
 * Advanced error handling with recovery strategies and performance monitoring
 */

'use client'

import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import { Button } from './button'
import { errorLogger } from '@/lib/services/error-logging.service'
import { useLoadingStore } from '@/lib/services/unified-loading.service'

interface EnhancedErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  errorMessage?: string
  showResetButton?: boolean
  showHomeButton?: boolean
  showBackButton?: boolean
  enableAutoRecovery?: boolean
  recoveryStrategies?: RecoveryStrategy[]
  performanceThreshold?: number
  category?: 'ui' | 'api' | 'auth' | 'payment' | 'database' | 'validation' | 'system'
}

interface EnhancedErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  recoveryAttempts: number
  isRecovering: boolean
  networkStatus: 'online' | 'offline' | 'slow'
  lastErrorTime: number
}

export interface RecoveryStrategy {
  name: string
  condition: (error: Error, errorInfo: ErrorInfo) => boolean
  action: () => Promise<boolean>
  maxAttempts: number
  delay: number
}

export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  private recoveryTimer: NodeJS.Timeout | null = null
  private networkListener: (() => void) | null = null

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: 0,
      isRecovering: false,
      networkStatus: 'online',
      lastErrorTime: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
      errorId: EnhancedErrorBoundary.generateErrorId(),
      lastErrorTime: Date.now()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const normalizedError = error instanceof Error ? error : new Error(String(error))
    
    // Enhanced error logging with context
    errorLogger.logUIError(normalizedError, {
      component: this.constructor.name,
      componentStack: errorInfo.componentStack,
      action: 'component_error',
      userId: this.getUserId(),
    })

    // Performance monitoring
    if (this.props.performanceThreshold) {
      this.monitorPerformance(normalizedError)
    }

    // Network status detection
    this.detectNetworkStatus()

    // Custom error handler
    if (this.props.onError) {
      this.props.onError(normalizedError, errorInfo)
    }

    this.setState({
      error: normalizedError,
      errorInfo
    })

    // Auto-recovery if enabled
    if (this.props.enableAutoRecovery) {
      this.attemptAutoRecovery(normalizedError, errorInfo)
    }
  }

  componentDidMount() {
    this.setupNetworkListener()
  }

  componentWillUnmount() {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer)
    }
    if (this.networkListener) {
      this.networkListener()
    }
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps) {
    if (this.props.resetOnPropsChange && prevProps !== this.props) {
      this.resetError()
    }
  }

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getUserId(): string | undefined {
    // Get user ID from your auth system
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  private monitorPerformance(error: Error) {
    const threshold = this.props.performanceThreshold || 100
    const renderTime = performance.now()
    
    if (renderTime > threshold) {
      errorLogger.logWarning(`Slow error boundary render: ${renderTime}ms`, {
        category: 'ui',
        context: {
          action: 'performance_warning',
          metadata: {
            renderTime,
            threshold,
            errorMessage: error.message
          }
        },
        tags: ['performance', 'error-boundary']
      })
    }
  }

  private detectNetworkStatus() {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      const isOnline = navigator.onLine
      const connection = (navigator as any).connection
      
      let networkStatus: 'online' | 'offline' | 'slow' = isOnline ? 'online' : 'offline'
      
      if (isOnline && connection) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          networkStatus = 'slow'
        }
      }
      
      this.setState({ networkStatus })
    }
  }

  private setupNetworkListener() {
    if (typeof window !== 'undefined') {
      const handleOnline = () => this.setState({ networkStatus: 'online' })
      const handleOffline = () => this.setState({ networkStatus: 'offline' })
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      this.networkListener = () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }

  private async attemptAutoRecovery(error: Error, errorInfo: ErrorInfo) {
    if (this.state.recoveryAttempts >= 3) return

    this.setState({ isRecovering: true })

    const strategies = this.props.recoveryStrategies || this.getDefaultRecoveryStrategies()
    
    for (const strategy of strategies) {
      if (strategy.condition(error, errorInfo) && this.state.recoveryAttempts < strategy.maxAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, strategy.delay))
          const success = await strategy.action()
          
          if (success) {
            errorLogger.logInfo(`Auto-recovery successful: ${strategy.name}`, {
              category: this.props.category || 'ui',
              context: {
                action: 'auto_recovery_success',
                metadata: {
                  strategy: strategy.name,
                  attempts: this.state.recoveryAttempts + 1
                }
              },
              tags: ['recovery', 'auto-recovery']
            })
            
            this.resetError()
            return
          }
        } catch (recoveryError) {
          errorLogger.logWarning(`Auto-recovery failed: ${strategy.name}`, {
            category: this.props.category || 'ui',
            context: {
              action: 'auto_recovery_failed',
              metadata: {
                strategy: strategy.name,
                attempts: this.state.recoveryAttempts + 1,
                recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
              }
            },
            tags: ['recovery', 'auto-recovery']
          })
        }
      }
    }

    this.setState({ 
      isRecovering: false,
      recoveryAttempts: this.state.recoveryAttempts + 1
    })
  }

  private getDefaultRecoveryStrategies(): RecoveryStrategy[] {
    return [
      {
        name: 'network_retry',
        condition: (error) => error.message.includes('fetch') || error.message.includes('network'),
        action: async () => {
          // Wait for network to come back online
          if (this.state.networkStatus === 'offline') {
            return new Promise(resolve => {
              const checkNetwork = () => {
                if (navigator.onLine) {
                  resolve(true)
                } else {
                  setTimeout(checkNetwork, 1000)
                }
              }
              checkNetwork()
            })
          }
          return true
        },
        maxAttempts: 3,
        delay: 2000
      },
      {
        name: 'component_remount',
        condition: (error) => error.name === 'ChunkLoadError' || error.message.includes('Loading chunk'),
        action: async () => {
          // Force component remount by clearing loading states
          useLoadingStore.getState().clearAllLoading()
          return true
        },
        maxAttempts: 2,
        delay: 1000
      },
      {
        name: 'cache_clear',
        condition: (error) => error.message.includes('cache') || error.message.includes('storage'),
        action: async () => {
          try {
            if (typeof window !== 'undefined' && 'caches' in window) {
              const cacheNames = await caches.keys()
              await Promise.all(cacheNames.map(name => caches.delete(name)))
            }
            return true
          } catch {
            return false
          }
        },
        maxAttempts: 1,
        delay: 500
      }
    ]
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: 0,
      isRecovering: false
    })
  }

  private goHome = () => {
    window.location.href = '/'
  }

  private goBack = () => {
    window.history.back()
  }

  private renderNetworkStatus() {
    const { networkStatus } = this.state
    
    if (networkStatus === 'offline') {
      return (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">You're currently offline</span>
        </div>
      )
    }
    
    if (networkStatus === 'slow') {
      return (
        <div className="flex items-center gap-2 text-yellow-600 mb-4">
          <Wifi className="h-4 w-4" />
          <span className="text-sm">Slow network detected</span>
        </div>
      )
    }
    
    return null
  }

  private renderRecoveryStatus() {
    if (this.state.isRecovering) {
      return (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Attempting automatic recovery...</span>
        </div>
      )
    }
    
    if (this.state.recoveryAttempts > 0) {
      return (
        <div className="text-sm text-gray-600 mb-4">
          Recovery attempts: {this.state.recoveryAttempts}/3
        </div>
      )
    }
    
    return null
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              {this.props.errorMessage || 'Something went wrong'}
            </h1>
            
            {this.renderNetworkStatus()}
            {this.renderRecoveryStatus()}
            
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Error Details:
                </p>
                <p className="text-sm text-red-700">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-6">
              {this.state.networkStatus === 'offline' 
                ? 'Please check your internet connection and try again.'
                : 'We encountered an unexpected error. Please try again or contact support if the problem persists.'
              }
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  {this.state.errorInfo && (
                    <div className="mb-2">
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
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
                  disabled={this.state.isRecovering}
                >
                  <RefreshCw className={`h-4 w-4 ${this.state.isRecovering ? 'animate-spin' : ''}`} />
                  {this.state.isRecovering ? 'Recovering...' : 'Try Again'}
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

// Enhanced error boundary with Suspense integration
export function SuspenseErrorBoundary({ 
  children, 
  fallback,
  ...errorBoundaryProps 
}: EnhancedErrorBoundaryProps & { fallback?: ReactNode }) {
  return (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Suspense fallback={fallback || <div>Loading...</div>}>
        {children}
      </Suspense>
    </EnhancedErrorBoundary>
  )
}

// HOC for automatic error boundary wrapping
export function withEnhancedErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<EnhancedErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  )

  WrappedComponent.displayName = `withEnhancedErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Context-aware error boundary
export function ContextAwareErrorBoundary({ 
  children, 
  context,
  ...props 
}: EnhancedErrorBoundaryProps & { context?: string }) {
  return (
    <EnhancedErrorBoundary
      {...props}
      onError={(error, errorInfo) => {
        errorLogger.logUIError(error, {
          component: context || 'ContextAwareErrorBoundary',
          componentStack: errorInfo.componentStack,
          action: 'context_error'
        })
        props.onError?.(error, errorInfo)
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}
