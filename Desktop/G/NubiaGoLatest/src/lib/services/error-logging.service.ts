/**
 * Centralized Error Logging Service
 * Provides consistent error handling, logging, and reporting across the application
 */

export interface ErrorLogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  category: 'ui' | 'api' | 'auth' | 'payment' | 'database' | 'validation' | 'system'
  message: string
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  context?: {
    userId?: string
    userRole?: string
    url?: string
    userAgent?: string
    sessionId?: string
    componentStack?: string
    action?: string
    data?: any
    metadata?: Record<string, any>
  }
  metadata?: Record<string, any>
  tags?: string[]
}

export interface ErrorReportingOptions {
  level?: 'error' | 'warn' | 'info' | 'debug'
  category?: ErrorLogEntry['category']
  context?: ErrorLogEntry['context']
  metadata?: Record<string, any>
  tags?: string[]
  reportToExternal?: boolean
  saveToDatabase?: boolean
  notifyTeam?: boolean
}

export class ErrorLoggingService {
  private static instance: ErrorLoggingService
  private errorQueue: ErrorLogEntry[] = []
  private isProcessing = false
  private maxQueueSize = 100
  private flushInterval = 5000 // 5 seconds

  private constructor() {
    this.setupPeriodicFlush()
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService()
    }
    return ErrorLoggingService.instance
  }

  /**
   * Log an error with full context
   */
  logError(
    error: Error | string,
    options: ErrorReportingOptions = {}
  ): string {
    const errorId = this.generateErrorId()
    const timestamp = new Date().toISOString()
    
    const errorData = typeof error === 'string' 
      ? { name: 'Error', message: error }
      : { name: error.name, message: error.message, stack: error.stack, code: (error as any).code }

    const logEntry: ErrorLogEntry = {
      id: errorId,
      timestamp,
      level: options.level || 'error',
      category: options.category || 'system',
      message: errorData.message,
      error: errorData,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        ...options.context
      },
      metadata: options.metadata,
      tags: options.tags
    }

    // Add to queue
    this.errorQueue.push(logEntry)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry)
    }

    // Process immediately if critical
    if (options.level === 'error' && options.reportToExternal !== false) {
      this.processErrorImmediately(logEntry)
    }

    // Flush queue if it's getting large
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushQueue()
    }

    return errorId
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    options: Omit<ErrorReportingOptions, 'level'> = {}
  ): string {
    return this.logError(message, { ...options, level: 'warn' })
  }

  /**
   * Log informational message
   */
  logInfo(
    message: string,
    options: Omit<ErrorReportingOptions, 'level'> = {}
  ): string {
    return this.logError(message, { ...options, level: 'info' })
  }

  /**
   * Log debug information
   */
  logDebug(
    message: string,
    options: Omit<ErrorReportingOptions, 'level'> = {}
  ): string {
    return this.logError(message, { ...options, level: 'debug' })
  }

  /**
   * Log API errors with request context
   */
  logAPIError(
    error: Error,
    requestContext: {
      method: string
      url: string
      statusCode?: number
      userId?: string
      userRole?: string
      requestId?: string
    }
  ): string {
    return this.logError(error, {
      category: 'api',
      context: {
        userId: requestContext.userId,
        userRole: requestContext.userRole,
        action: `${requestContext.method} ${requestContext.url}`,
        metadata: {
          method: requestContext.method,
          url: requestContext.url,
          statusCode: requestContext.statusCode,
          requestId: requestContext.requestId
        }
      },
      tags: ['api', requestContext.method.toLowerCase()]
    })
  }

  /**
   * Log authentication errors
   */
  logAuthError(
    error: Error,
    context: {
      userId?: string
      action: string
      ip?: string
      userAgent?: string
    }
  ): string {
    return this.logError(error, {
      category: 'auth',
      context: {
        userId: context.userId,
        action: context.action,
        userAgent: context.userAgent,
        metadata: { ip: context.ip }
      },
      tags: ['auth', 'security']
    })
  }

  /**
   * Log payment errors
   */
  logPaymentError(
    error: Error,
    context: {
      userId?: string
      orderId?: string
      amount?: number
      paymentMethod?: string
      transactionId?: string
    }
  ): string {
    return this.logError(error, {
      category: 'payment',
      context: {
        userId: context.userId,
        action: 'payment_processing',
        metadata: {
          orderId: context.orderId,
          amount: context.amount,
          paymentMethod: context.paymentMethod,
          transactionId: context.transactionId
        }
      },
      tags: ['payment', 'financial'],
      notifyTeam: true // Payment errors should notify the team
    })
  }

  /**
   * Log validation errors
   */
  logValidationError(
    error: Error,
    context: {
      userId?: string
      form?: string
      field?: string
      value?: any
    }
  ): string {
    return this.logError(error, {
      category: 'validation',
      level: 'warn',
      context: {
        userId: context.userId,
        action: 'form_validation',
        metadata: {
          form: context.form,
          field: context.field,
          value: context.value
        }
      },
      tags: ['validation', 'form']
    })
  }

  /**
   * Log UI errors
   */
  logUIError(
    error: Error,
    context: {
      component?: string
      userId?: string
      action?: string
      componentStack?: string
    }
  ): string {
    return this.logError(error, {
      category: 'ui',
      context: {
        userId: context.userId,
        action: context.action || 'ui_interaction',
        componentStack: context.componentStack,
        metadata: { component: context.component }
      },
      tags: ['ui', 'frontend']
    })
  }

  /**
   * Get error by ID
   */
  async getErrorById(errorId: string): Promise<ErrorLogEntry | null> {
    try {
      // Try to get from local storage first
      let stored: string | null = null
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          stored = localStorage.getItem(`error_${errorId}`)
        } catch (error) {
          console.warn('Failed to read error from localStorage:', error)
        }
      }
      
      if (stored) {
        return JSON.parse(stored)
      }

      // Try to get from database
      const response = await fetch(`/api/errors/${errorId}`)
      if (response.ok) {
        return await response.json()
      }

      return null
    } catch (error) {
      console.error('Failed to get error by ID:', error)
      return null
    }
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(limit: number = 50): Promise<ErrorLogEntry[]> {
    try {
      const response = await fetch(`/api/errors?limit=${limit}`)
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Failed to get recent errors:', error)
      return []
    }
  }

  /**
   * Clear error queue
   */
  clearQueue(): void {
    this.errorQueue = []
  }

  /**
   * Force flush of error queue
   */
  async flushQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return
    }

    this.isProcessing = true
    const errorsToProcess = [...this.errorQueue]
    this.errorQueue = []

    try {
      // Process errors in batches
      const batchSize = 10
      for (let i = 0; i < errorsToProcess.length; i += batchSize) {
        const batch = errorsToProcess.slice(i, i + batchSize)
        await this.processErrorBatch(batch)
      }
    } catch (error) {
      console.error('Failed to flush error queue:', error)
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errorsToProcess)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a batch of errors
   */
  private async processErrorBatch(errors: ErrorLogEntry[]): Promise<void> {
    try {
      // Save to database
      await this.saveErrorsToDatabase(errors)

      // Report to external services
      await this.reportToExternalServices(errors)

      // Send notifications if needed
      await this.sendNotifications(errors)

    } catch (error) {
      console.error('Failed to process error batch:', error)
    }
  }

  /**
   * Save errors to database
   */
  private async saveErrorsToDatabase(errors: ErrorLogEntry[]): Promise<void> {
    try {
      const response = await fetch('/api/errors/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      })

      if (!response.ok) {
        throw new Error(`Failed to save errors: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to save errors to database:', error)
      throw error
    }
  }

  /**
   * Report errors to external services
   */
  private async reportToExternalServices(errors: ErrorLogEntry[]): Promise<void> {
    const criticalErrors = errors.filter(e => e.level === 'error')

    for (const error of criticalErrors) {
      try {
        // Report to Sentry if available
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(new Error(error.message), {
            contexts: {
              error: {
                id: error.id,
                category: error.category,
                level: error.level
              },
              user: error.context?.userId ? { id: error.context.userId } : undefined
            },
            tags: {
              category: error.category,
              level: error.level,
              ...error.tags?.reduce((acc, tag) => ({ ...acc, [tag]: true }), {})
            },
            extra: {
              errorId: error.id,
              context: error.context,
              metadata: error.metadata
            }
          })
        }

        // Report to other external services as needed
        await this.reportToCustomServices(error)

      } catch (reportError) {
        console.error('Failed to report error to external service:', reportError)
      }
    }
  }

  /**
   * Report to custom error reporting services
   */
  private async reportToCustomServices(error: ErrorLogEntry): Promise<void> {
    // Implement custom error reporting logic here
    // For example, sending to your own error tracking service
    try {
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_URL) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        })
      }
    } catch (reportError) {
      console.error('Failed to report to custom service:', reportError)
    }
  }

  /**
   * Send notifications for critical errors
   */
  private async sendNotifications(errors: ErrorLogEntry[]): Promise<void> {
    const criticalErrors = errors.filter(e => 
      e.level === 'error' && e.category !== 'validation'
    )

    if (criticalErrors.length === 0) return

    try {
      // Send email notification
      await fetch('/api/notifications/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: criticalErrors })
      })
    } catch (error) {
      console.error('Failed to send error notifications:', error)
    }
  }

  /**
   * Setup periodic queue flushing
   */
  private setupPeriodicFlush(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.flushQueue()
      }, this.flushInterval)
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled errors
      window.addEventListener('error', (event) => {
        this.logError(event.error || new Error(event.message), {
          category: 'ui',
          context: {
            action: 'unhandled_error',
            url: event.filename,
            metadata: {
              lineNumber: event.lineno,
              columnNumber: event.colno
            }
          },
          tags: ['unhandled', 'global']
        })
      })

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(new Error(event.reason), {
          category: 'ui',
          context: {
            action: 'unhandled_promise_rejection',
            metadata: { reason: event.reason }
          },
          tags: ['unhandled', 'promise', 'global']
        })
      })
    }
  }

  /**
   * Log to console (development only)
   */
  private logToConsole(logEntry: ErrorLogEntry): void {
    const { level, message, error, context, metadata } = logEntry
    
    const logMethod = console[level] || console.log
    const prefix = `[${logEntry.timestamp}] [${level.toUpperCase()}] [${logEntry.category}]`
    
    logMethod(`${prefix}: ${message}`, {
      error,
      context,
      metadata,
      errorId: logEntry.id
    })
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Process error immediately for critical errors
   */
  private async processErrorImmediately(logEntry: ErrorLogEntry): Promise<void> {
    try {
      await this.processErrorBatch([logEntry])
    } catch (error) {
      console.error('Failed to process error immediately:', error)
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLoggingService.getInstance()

// Export convenience functions
export const logError = (error: Error | string, options?: ErrorReportingOptions) =>
  errorLogger.logError(error, options)

export const logWarning = (message: string, options?: Omit<ErrorReportingOptions, 'level'>) =>
  errorLogger.logWarning(message, options)

export const logInfo = (message: string, options?: Omit<ErrorReportingOptions, 'level'>) =>
  errorLogger.logInfo(message, options)

export const logDebug = (message: string, options?: Omit<ErrorReportingOptions, 'level'>) =>
  errorLogger.logDebug(message, options)

export const logAPIError = (error: Error, context: any) =>
  errorLogger.logAPIError(error, context)

export const logAuthError = (error: Error, context: any) =>
  errorLogger.logAuthError(error, context)

export const logPaymentError = (error: Error, context: any) =>
  errorLogger.logPaymentError(error, context)

export const logValidationError = (error: Error, context: any) =>
  errorLogger.logValidationError(error, context)

export const logUIError = (error: Error, context: any) =>
  errorLogger.logUIError(error, context)
