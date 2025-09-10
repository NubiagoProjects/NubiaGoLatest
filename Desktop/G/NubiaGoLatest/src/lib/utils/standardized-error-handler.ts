// Standardized Error Handler Utility
// Provides consistent error handling patterns across all services

import { logger } from './logger'
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, RateLimitError, ApiError } from './error-handler'

// Standard error response format
export interface StandardErrorResponse {
  success: false
  error: {
    message: string
    code: string
    statusCode: number
    details?: Record<string, any>
  }
}

// Standard success response format
export interface StandardSuccessResponse<T = any> {
  success: true
  data: T
}

// Union type for all responses
export type StandardResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse

// Error handling utilities
export class StandardizedErrorHandler {
  /**
   * Create a standardized error response
   */
  static createErrorResponse(
    error: unknown,
    context?: Record<string, any>
  ): StandardErrorResponse {
    const appError = this.normalizeError(error, context)
    
    // Log the error
    logger.error(`Error handled: ${appError.message}`, {
      code: appError.code,
      statusCode: appError.statusCode,
      context: appError.context,
      stack: appError.stack
    })

    return {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
        statusCode: appError.statusCode,
        details: appError.context
      }
    }
  }

  /**
   * Create a standardized success response
   */
  static createSuccessResponse<T>(data: T): StandardSuccessResponse<T> {
    return {
      success: true,
      data
    }
  }

  /**
   * Normalize any error to AppError
   */
  static normalizeError(error: unknown, context?: Record<string, any>): AppError {
    if (error instanceof AppError) {
      if (context) {
        // Create a new error instance with merged context
        return new AppError(
          error.message,
          error.code,
          error.statusCode,
          error.isOperational,
          { ...error.context, ...context }
        )
      }
      return error
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        true,
        { originalError: error, ...context }
      )
    }

    return new AppError(
      String(error),
      'UNKNOWN_ERROR',
      500,
      true,
      { originalError: error, ...context }
    )
  }

  /**
   * Handle async operations with standardized error handling
   */
  static async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<StandardResponse<T>> {
    try {
      const result = await asyncFn()
      return this.createSuccessResponse(result)
    } catch (error) {
      return this.createErrorResponse(error, context)
    }
  }

  /**
   * Handle async operations that return data directly
   */
  static async handleAsyncData<T>(
    asyncFn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> {
    try {
      return await asyncFn()
    } catch (error) {
      this.createErrorResponse(error, context)
      return null
    }
  }

  /**
   * Create specific error types with context
   */
  static createValidationError(message: string, context?: Record<string, any>): ValidationError {
    return new ValidationError(message, context)
  }

  static createAuthenticationError(message?: string, context?: Record<string, any>): AuthenticationError {
    return new AuthenticationError(message, context)
  }

  static createAuthorizationError(message?: string, context?: Record<string, any>): AuthorizationError {
    return new AuthorizationError(message, context)
  }

  static createNotFoundError(message?: string, context?: Record<string, any>): NotFoundError {
    return new NotFoundError(message, context)
  }

  static createConflictError(message?: string, context?: Record<string, any>): ConflictError {
    return new ConflictError(message, context)
  }

  static createRateLimitError(message?: string, context?: Record<string, any>): RateLimitError {
    return new RateLimitError(message, context)
  }

  static createApiError(message: string, statusCode?: number, context?: Record<string, any>): ApiError {
    return new ApiError(message, statusCode, context)
  }
}

// Convenience functions for common patterns
export const handleAsync = StandardizedErrorHandler.handleAsync
export const handleAsyncData = StandardizedErrorHandler.handleAsyncData
export const createErrorResponse = StandardizedErrorHandler.createErrorResponse
export const createSuccessResponse = StandardizedErrorHandler.createSuccessResponse

// Export error types for use in services
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ApiError
}
