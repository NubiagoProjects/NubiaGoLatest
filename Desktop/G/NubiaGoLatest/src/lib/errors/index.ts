// Error Handling System
// Centralized error management for better debugging and user experience

export class BaseError extends Error {
  public readonly name: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// Authentication Errors
export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 401, true, context)
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 403, true, context)
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message: string = 'Token expired', context?: Record<string, any>) {
    super(message, 401, true, context)
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(message: string = 'Invalid credentials', context?: Record<string, any>) {
    super(message, 401, true, context)
  }
}

// Validation Errors
export class ValidationError extends BaseError {
  public readonly fieldErrors: Record<string, string[]>

  constructor(
    message: string = 'Validation failed',
    fieldErrors: Record<string, string[]> = {},
    context?: Record<string, any>
  ) {
    super(message, 400, true, context)
    this.fieldErrors = fieldErrors
  }
}

export class RequiredFieldError extends BaseError {
  constructor(field: string, context?: Record<string, any>) {
    super(`Field '${field}' is required`, 400, true, context)
  }
}

export class InvalidFormatError extends BaseError {
  constructor(field: string, format: string, context?: Record<string, any>) {
    super(`Field '${field}' must be in ${format} format`, 400, true, context)
  }
}

// Resource Errors
export class NotFoundError extends BaseError {
  constructor(resource: string, identifier?: string, context?: Record<string, any>) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, true, context)
  }
}

export class ConflictError extends BaseError {
  constructor(message: string = 'Resource conflict', context?: Record<string, any>) {
    super(message, 409, true, context)
  }
}

export class DuplicateResourceError extends BaseError {
  constructor(resource: string, field: string, value: string, context?: Record<string, any>) {
    super(`${resource} with ${field} '${value}' already exists`, 409, true, context)
  }
}

// API Errors
export class APIError extends BaseError {
  public readonly endpoint: string
  public readonly method: string

  constructor(
    message: string,
    endpoint: string,
    method: string = 'GET',
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message, statusCode, true, context)
    this.endpoint = endpoint
    this.method = method
  }
}

export class RateLimitError extends BaseError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60, context?: Record<string, any>) {
    super('Rate limit exceeded', 429, true, context)
    this.retryAfter = retryAfter
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(service: string, context?: Record<string, any>) {
    super(`Service '${service}' is temporarily unavailable`, 503, true, context)
  }
}

// Business Logic Errors
export class InsufficientStockError extends BaseError {
  constructor(productId: string, requested: number, available: number, context?: Record<string, any>) {
    super(
      `Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`,
      400,
      true,
      context
    )
  }
}

export class PaymentError extends BaseError {
  constructor(message: string, paymentMethod: string, context?: Record<string, any>) {
    super(`Payment failed: ${message}`, 400, true, { ...context, paymentMethod })
  }
}

export class OrderError extends BaseError {
  constructor(message: string, orderId?: string, context?: Record<string, any>) {
    super(`Order error: ${message}`, 400, true, { ...context, orderId })
  }
}

// Database Errors
export class DatabaseError extends BaseError {
  public readonly operation: string
  public readonly table?: string

  constructor(
    message: string,
    operation: string,
    table?: string,
    context?: Record<string, any>
  ) {
    super(message, 500, false, context)
    this.operation = operation
    this.table = table
  }
}

export class ConnectionError extends BaseError {
  constructor(service: string, context?: Record<string, any>) {
    super(`Failed to connect to ${service}`, 500, false, context)
  }
}

// File/Upload Errors
export class FileUploadError extends BaseError {
  public readonly fileName: string
  public readonly fileSize: number

  constructor(
    message: string,
    fileName: string,
    fileSize: number,
    context?: Record<string, any>
  ) {
    super(message, 400, true, context)
    this.fileName = fileName
    this.fileSize = fileSize
  }
}

export class FileSizeError extends BaseError {
  constructor(fileName: string, maxSize: number, context?: Record<string, any>) {
    super(
      `File '${fileName}' exceeds maximum size of ${maxSize} bytes`,
      400,
      true,
      context
    )
  }
}

export class FileTypeError extends BaseError {
  constructor(fileName: string, allowedTypes: string[], context?: Record<string, any>) {
    super(
      `File '${fileName}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      400,
      true,
      context
    )
  }
}

// Error Factory Functions
export const createError = {
  authentication: (message?: string, context?: Record<string, any>) => 
    new AuthenticationError(message, context),
  
  authorization: (message?: string, context?: Record<string, any>) => 
    new AuthorizationError(message, context),
  
  validation: (message?: string, fieldErrors?: Record<string, string[]>, context?: Record<string, any>) => 
    new ValidationError(message, fieldErrors, context),
  
  notFound: (resource: string, identifier?: string, context?: Record<string, any>) => 
    new NotFoundError(resource, identifier, context),
  
  conflict: (message?: string, context?: Record<string, any>) => 
    new ConflictError(message, context),
  
  api: (message: string, endpoint: string, method?: string, statusCode?: number, context?: Record<string, any>) => 
    new APIError(message, endpoint, method, statusCode, context),
  
  database: (message: string, operation: string, table?: string, context?: Record<string, any>) => 
    new DatabaseError(message, operation, table, context),
  
  fileUpload: (message: string, fileName: string, fileSize: number, context?: Record<string, any>) => 
    new FileUploadError(message, fileName, fileSize, context),
}

// Error Response Formatter
export const formatErrorResponse = (error: BaseError) => {
  return {
    success: false,
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      ...(error.context && { context: error.context }),
      ...(error instanceof ValidationError && { fieldErrors: error.fieldErrors }),
      ...(error instanceof APIError && { 
        endpoint: error.endpoint, 
        method: error.method 
      }),
      ...(error instanceof RateLimitError && { retryAfter: error.retryAfter }),
      ...(error instanceof FileUploadError && { 
        fileName: error.fileName, 
        fileSize: error.fileSize 
      }),
    },
    timestamp: new Date().toISOString(),
  }
}

// Error Handler
export const handleError = (error: unknown): BaseError => {
  if (error instanceof BaseError) {
    return error
  }

  if (error instanceof Error) {
    return new BaseError(error.message, 500, false)
  }

  return new BaseError('An unexpected error occurred', 500, false)
}

const errorClasses = {
  BaseError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  APIError,
  RateLimitError,
  ServiceUnavailableError,
  InsufficientStockError,
  PaymentError,
  OrderError,
  DatabaseError,
  ConnectionError,
  FileUploadError,
  FileSizeError,
  FileTypeError,
  createError,
  formatErrorResponse,
  handleError,
}

export default errorClasses
