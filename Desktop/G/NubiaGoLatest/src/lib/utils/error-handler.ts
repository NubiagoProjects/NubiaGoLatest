import { logger } from './logger'

// Error types for better error handling
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, context)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 'NOT_FOUND_ERROR', 404, true, context)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Record<string, any>) {
    super(message, 'CONFLICT_ERROR', 409, true, context)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, context)
    this.name = 'RateLimitError'
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number = 500, context?: Record<string, any>) {
    super(message, 'API_ERROR', statusCode, true, context)
    this.name = 'ApiError'
  }
}

// Error handler utility
export class ErrorHandler {
  /**
   * Handle and log errors with appropriate context
   */
  static handle(error: unknown, context?: Record<string, any>): AppError {
    let appError: AppError

    if (error instanceof AppError) {
      appError = error
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        true,
        { originalError: error, ...context }
      )
    } else {
      appError = new AppError(
        String(error),
        'UNKNOWN_ERROR',
        500,
        true,
        { originalError: error, ...context }
      )
    }

    // Log the error
    this.logError(appError, context)

    return appError
  }

  /**
   * Log error with structured information
   */
  private static logError(error: AppError, context?: Record<string, any>): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      context: { ...error.context, ...context },
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    if (error.statusCode >= 500) {
      logger.error('❌ CRITICAL ERROR:', errorInfo)
    } else if (error.statusCode >= 400) {
      logger.warn('⚠️ CLIENT ERROR:', errorInfo)
    } else {
      logger.info('ℹ️ INFO ERROR:', errorInfo)
    }
  }

  /**
   * Send error to monitoring service
   */
  static async sendToMonitoring(error: AppError, context?: Record<string, any>): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    try {
      // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            app: {
              errorCode: error.code,
              statusCode: error.statusCode,
              isOperational: error.isOperational,
              ...context
            }
          },
          tags: {
            errorType: error.name,
            errorCode: error.code,
            statusCode: error.statusCode.toString()
          }
        })
      }

      // Send to custom monitoring endpoint
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack
          },
          context: { ...error.context, ...context },
          timestamp: new Date().toISOString()
        })
      })
    } catch (monitoringError) {
      logger.error('❌ Failed to send error to monitoring:', monitoringError)
    }
  }

  /**
   * Check if error is operational (expected) or programming (unexpected)
   */
  static isOperational(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isOperational
    }
    return false
  }

  /**
   * Create user-friendly error message
   */
  static getUserFriendlyMessage(error: unknown): string {
    if (error instanceof AppError) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
          return 'Please check your input and try again.'
        case 'AUTHENTICATION_ERROR':
          return 'Please log in to continue.'
        case 'AUTHORIZATION_ERROR':
          return 'You don\'t have permission to perform this action.'
        case 'NOT_FOUND_ERROR':
          return 'The requested resource was not found.'
        case 'CONFLICT_ERROR':
          return 'This action conflicts with existing data.'
        case 'RATE_LIMIT_ERROR':
          return 'Too many requests. Please try again later.'
        case 'API_ERROR':
          return 'A service error occurred. Please try again.'
        default:
          return 'An unexpected error occurred. Please try again.'
      }
    }
    return 'An unexpected error occurred. Please try again.'
  }
}

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  try {
    return await asyncFn()
  } catch (error) {
    throw ErrorHandler.handle(error, context)
  }
}

export const handleSyncError = <T>(
  syncFn: () => T,
  context?: Record<string, any>
): T => {
  try {
    return syncFn()
  } catch (error) {
    throw ErrorHandler.handle(error, context)
  }
}

// Error boundary error handler
export const handleErrorBoundaryError = (error: Error, errorInfo: React.ErrorInfo): void => {
  const appError = ErrorHandler.handle(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  })

  // Send to monitoring
  ErrorHandler.sendToMonitoring(appError, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  })
}

// Export default instance
export default ErrorHandler

