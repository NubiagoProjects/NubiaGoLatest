// ============================================================================
// INPUT VALIDATOR UTILITY - Security & Data Integrity
// ============================================================================

export interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'email' | 'phone' | 'url' | 'boolean' | 'array' | 'object'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationSchema {
  [endpoint: string]: ValidationRule[]
}

// Validation schemas for different endpoints
const validationSchemas: ValidationSchema = {
  '/api/auth/register': [
    { field: 'email', type: 'email', required: true, maxLength: 255 },
    { field: 'password', type: 'string', required: true, minLength: 8, maxLength: 128 },
    { field: 'name', type: 'string', required: true, minLength: 2, maxLength: 100 },
    { field: 'phone', type: 'phone', required: false, maxLength: 20 }
  ],
  '/api/auth/login': [
    { field: 'email', type: 'email', required: true, maxLength: 255 },
    { field: 'password', type: 'string', required: true, minLength: 1, maxLength: 128 }
  ],
  '/api/products': [
    { field: 'name', type: 'string', required: true, minLength: 2, maxLength: 200 },
    { field: 'description', type: 'string', required: false, maxLength: 2000 },
    { field: 'price', type: 'number', required: true, min: 0, max: 1000000 },
    { field: 'category', type: 'string', required: true, maxLength: 100 },
    { field: 'stock', type: 'number', required: true, min: 0, max: 100000 }
  ],
  '/api/orders': [
    { field: 'items', type: 'array', required: true },
    { field: 'shippingAddress', type: 'object', required: true },
    { field: 'paymentMethod', type: 'string', required: true, maxLength: 50 }
  ],
  '/api/users/profile': [
    { field: 'name', type: 'string', required: false, minLength: 2, maxLength: 100 },
    { field: 'phone', type: 'phone', required: false, maxLength: 20 },
    { field: 'address', type: 'string', required: false, maxLength: 500 }
  ]
}

export function validateInput(data: any, endpoint: string): string[] {
  const errors: string[] = []
  const schema = validationSchemas[endpoint]
  
  if (!schema) {
    return [] // No validation rules for this endpoint
  }

  for (const rule of schema) {
    const value = data[rule.field]
    const fieldErrors = validateField(rule.field, value, rule)
    errors.push(...fieldErrors)
  }

  return errors
}

export function validateField(fieldName: string, value: any, rule: ValidationRule): string[] {
  const errors: string[] = []

  // Required field check
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`)
    return errors
  }

  // Skip validation if field is not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return errors
  }

  // Type validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`)
        break
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldName} must be at least ${rule.minLength} characters`)
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldName} must not exceed ${rule.maxLength} characters`)
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${fieldName} format is invalid`)
      }
      break

    case 'number':
      const numValue = Number(value)
      if (isNaN(numValue)) {
        errors.push(`${fieldName} must be a valid number`)
        break
      }
      
      if (rule.min !== undefined && numValue < rule.min) {
        errors.push(`${fieldName} must be at least ${rule.min}`)
      }
      
      if (rule.max !== undefined && numValue > rule.max) {
        errors.push(`${fieldName} must not exceed ${rule.max}`)
      }
      break

    case 'email':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`)
        break
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors.push(`${fieldName} must be a valid email address`)
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldName} must not exceed ${rule.maxLength} characters`)
      }
      break

    case 'phone':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`)
        break
      }
      
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        errors.push(`${fieldName} must be a valid phone number`)
      }
      break

    case 'url':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`)
        break
      }
      
      try {
        new URL(value)
      } catch {
        errors.push(`${fieldName} must be a valid URL`)
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${fieldName} must be a boolean`)
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${fieldName} must be an array`)
      }
      break

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${fieldName} must be an object`)
      }
      break
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value)
    if (customError) {
      errors.push(customError)
    }
  }

  return errors
}

// Sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '') // Only allow word chars, @, ., -
}

export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return ''
  
  return phone
    .replace(/[^\d\+\-\(\)\s]/g, '') // Only allow digits and common phone chars
    .trim()
}

export function sanitizeNumber(input: any): number | null {
  const num = Number(input)
  return isNaN(num) ? null : num
}

// SQL injection prevention
export function escapeSQLString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
}

// XSS prevention
export function escapeHTML(input: string): string {
  if (typeof input !== 'string') return ''
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  
  return input.replace(/[&<>"'/]/g, (s) => map[s])
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password must be at least 8 characters long')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain uppercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain numbers')
  }

  if (/[^a-zA-Z\d]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain special characters')
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

// File upload validation
export function validateFileUpload(file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): string[] {
  const errors: string[] = []
  
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`File size must not exceed ${Math.round(options.maxSize / 1024 / 1024)}MB`)
  }
  
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }
  
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`)
    }
  }
  
  return errors
}

// Export validation schemas for external use
export { validationSchemas }
