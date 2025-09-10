import { z } from 'zod'

/**
 * Utility functions for input sanitization
 */
const sanitizeString = (str: string) => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
}

const sanitizeHTML = (html: string) => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

const validateURL = (url: string) => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Base validation schemas
 */
export const baseStringSchema = z.string()
  .min(1, 'This field is required')

export const baseEmailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .refine(validateEmail, 'Invalid email format')

export const basePhoneSchema = z.string()
  .min(1, 'Phone number is required')
  .refine(validatePhone, 'Invalid phone number format')

export const baseURLSchema = z.string()
  .min(1, 'URL is required')
  .refine(validateURL, 'Invalid URL format')

export const baseHTMLSchema = z.string()
  .min(1, 'Content is required')

// Helper function to apply sanitization after validation
const createSanitizedSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.transform((val) => {
    if (typeof val === 'string') {
      return sanitizeString(val)
    }
    return val
  })
}

const createSanitizedHTMLSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.transform((val) => {
    if (typeof val === 'string') {
      return sanitizeHTML(val)
    }
    return val
  })
}

/**
 * User validation schemas
 */
export const userRegistrationSchema = z.object({
  email: createSanitizedSchema(baseEmailSchema),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  displayName: createSanitizedSchema(baseStringSchema
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')),
  phoneNumber: createSanitizedSchema(basePhoneSchema).optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  marketingConsent: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const userLoginSchema = z.object({
  email: baseEmailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export const userProfileUpdateSchema = z.object({
  displayName: baseStringSchema
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  phoneNumber: basePhoneSchema.optional(),
  bio: baseStringSchema
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  marketingConsent: z.boolean().optional()
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"]
})

/**
 * Product validation schemas
 */
export const productCreateSchema = z.object({
  name: baseStringSchema
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must be less than 200 characters'),
  description: baseHTMLSchema
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  price: z.number()
    .positive('Price must be positive')
    .min(0.01, 'Price must be at least $0.01')
    .max(999999.99, 'Price must be less than $1,000,000'),
  compareAtPrice: z.number()
    .positive('Compare at price must be positive')
    .optional(),
  costPerItem: z.number()
    .positive('Cost per item must be positive')
    .optional(),
  sku: baseStringSchema
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  barcode: baseStringSchema
    .max(50, 'Barcode must be less than 50 characters')
    .optional(),
  weight: z.number()
    .positive('Weight must be positive')
    .max(1000, 'Weight must be less than 1000 kg')
    .optional(),
  weightUnit: z.enum(['kg', 'lb', 'g', 'oz']).optional(),
  dimensions: z.object({
    length: z.number().positive('Length must be positive').optional(),
    width: z.number().positive('Width must be positive').optional(),
    height: z.number().positive('Height must be positive').optional(),
    unit: z.enum(['cm', 'in', 'm', 'ft']).optional()
  }).optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(baseStringSchema)
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  variants: z.array(z.object({
    name: baseStringSchema.min(1, 'Variant name is required'),
    options: z.array(baseStringSchema).min(1, 'At least one option is required'),
    price: z.number().positive('Variant price must be positive').optional(),
    sku: baseStringSchema.optional(),
    inventory: z.number().int().min(0, 'Inventory cannot be negative').optional()
  })).optional(),
  inventory: z.number()
    .int('Inventory must be a whole number')
    .min(0, 'Inventory cannot be negative'),
  lowStockThreshold: z.number()
    .int('Low stock threshold must be a whole number')
    .min(0, 'Low stock threshold cannot be negative')
    .optional(),
  trackInventory: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  seoTitle: baseStringSchema
    .max(60, 'SEO title must be less than 60 characters')
    .optional(),
  seoDescription: baseStringSchema
    .max(160, 'SEO description must be less than 160 characters')
    .optional(),
  metaKeywords: z.array(baseStringSchema)
    .max(20, 'Maximum 20 meta keywords allowed')
    .optional(),
  productHighlights: z.array(baseStringSchema)
    .max(10, 'Maximum 10 product highlights allowed')
    .optional(),
  brandName: baseStringSchema
    .max(100, 'Brand name must be less than 100 characters')
    .optional(),
  brandRegistry: baseStringSchema
    .max(100, 'Brand registry must be less than 100 characters')
    .optional(),
  modelNumber: baseStringSchema
    .max(100, 'Model number must be less than 100 characters')
    .optional(),
  upcEanIsbn: baseStringSchema
    .max(50, 'UPC/EAN/ISBN must be less than 50 characters')
    .optional(),
  materialComposition: baseStringSchema
    .max(500, 'Material composition must be less than 500 characters')
    .optional(),
  sizeCharts: baseStringSchema
    .max(1000, 'Size charts must be less than 1000 characters')
    .optional(),
  fitGuides: baseStringSchema
    .max(1000, 'Fit guides must be less than 1000 characters')
    .optional(),
  otherDetails: baseStringSchema
    .max(1000, 'Other details must be less than 1000 characters')
    .optional()
})

export const productUpdateSchema = productCreateSchema.partial()

/**
 * Address validation schemas
 */
export const addressSchema = z.object({
  firstName: baseStringSchema
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: baseStringSchema
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  company: baseStringSchema
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  addressLine1: baseStringSchema
    .min(5, 'Address must be at least 5 characters')
    .max(100, 'Address must be less than 100 characters'),
  addressLine2: baseStringSchema
    .max(100, 'Address line 2 must be less than 100 characters')
    .optional(),
  city: baseStringSchema
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  state: baseStringSchema
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters'),
  postalCode: baseStringSchema
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters'),
  country: baseStringSchema
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be less than 50 characters'),
  phone: basePhoneSchema.optional()
})

/**
 * Payment validation schemas
 */
export const paymentMethodSchema = z.object({
  type: z.enum(['credit_card', 'debit_card', 'paypal', 'mobile_money', 'bank_transfer']),
  token: z.string().min(1, 'Payment token is required'),
  saveForFuture: z.boolean().optional()
})

export const mobileMoneyPaymentSchema = z.object({
  operator: z.string().min(1, 'Mobile money operator is required'),
  phoneNumber: basePhoneSchema,
  amount: z.number()
    .positive('Amount must be positive')
    .min(0.01, 'Amount must be at least $0.01'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES']).default('USD'),
  reference: z.string().min(1, 'Payment reference is required'),
  description: baseStringSchema
    .max(200, 'Description must be less than 200 characters')
    .optional()
})

/**
 * Order validation schemas
 */
export const orderCreateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    quantity: z.number()
      .int('Quantity must be a whole number')
      .positive('Quantity must be positive')
      .max(100, 'Quantity cannot exceed 100')
  })).min(1, 'At least one item is required'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: paymentMethodSchema,
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  notes: baseStringSchema
    .max(500, 'Order notes must be less than 500 characters')
    .optional(),
  marketingConsent: z.boolean().optional()
})

/**
 * Search and filter validation schemas
 */
export const searchFiltersSchema = z.object({
  query: baseStringSchema
    .max(200, 'Search query must be less than 200 characters')
    .optional(),
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price cannot be negative').optional(),
    max: z.number().positive('Maximum price must be positive').optional()
  }).optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'backorder']).optional(),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'newest', 'rating', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1, 'Page must be at least 1').optional(),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional()
})

/**
 * Supplier application validation schema
 */
export const supplierApplicationSchema = z.object({
  businessName: baseStringSchema
    .min(3, 'Business name must be at least 3 characters')
    .max(100, 'Business name must be less than 100 characters'),
  businessType: z.enum(['individual', 'corporation', 'partnership', 'llc']),
  taxId: baseStringSchema
    .max(50, 'Tax ID must be less than 50 characters')
    .optional(),
  businessAddress: addressSchema,
  businessPhone: basePhoneSchema,
  businessEmail: baseEmailSchema,
  website: baseURLSchema.optional(),
  description: baseStringSchema
    .min(50, 'Business description must be at least 50 characters')
    .max(1000, 'Business description must be less than 1000 characters'),
  categories: z.array(z.string())
    .min(1, 'At least one category is required')
    .max(10, 'Maximum 10 categories allowed'),
  documents: z.array(z.object({
    type: z.enum(['business_license', 'tax_certificate', 'identity_document', 'other']),
    url: z.string().url('Invalid document URL'),
    name: baseStringSchema.min(1, 'Document name is required')
  })).min(1, 'At least one document is required'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
})

/**
 * Review validation schema
 */
export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: baseStringSchema
    .min(3, 'Review title must be at least 3 characters')
    .max(100, 'Review title must be less than 100 characters'),
  content: baseStringSchema
    .min(10, 'Review content must be at least 10 characters')
    .max(1000, 'Review content must be less than 1000 characters'),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional(),
  anonymous: z.boolean().optional()
})

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: baseStringSchema
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: baseEmailSchema,
  subject: baseStringSchema
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: baseStringSchema
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  category: z.enum(['general', 'support', 'sales', 'technical', 'billing']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
})

/**
 * Newsletter subscription schema
 */
export const newsletterSubscriptionSchema = z.object({
  email: baseEmailSchema,
  firstName: baseStringSchema
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: baseStringSchema
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  preferences: z.array(z.enum(['promotions', 'new_products', 'blog_posts', 'events'])).optional(),
  consent: z.boolean().refine(val => val === true, 'You must consent to receive emails')
})

/**
 * API Configuration validation schema
 */
export const apiConfigurationSchema = z.object({
  name: baseStringSchema
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: baseStringSchema
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  type: z.enum(['logistics', 'payment', 'communication', 'analytics', 'storage', 'other']),
  provider: baseStringSchema
    .min(2, 'Provider must be at least 2 characters')
    .max(50, 'Provider must be less than 50 characters'),
  apiKey: baseStringSchema
    .min(1, 'API key is required'),
  apiSecret: baseStringSchema.optional(),
  baseUrl: baseURLSchema.optional(),
  webhookUrl: baseURLSchema.optional(),
  isActive: z.boolean().optional(),
  isTestMode: z.boolean().optional(),
  config: z.record(z.any()).optional()
})

/**
 * Export all schemas
 */
export const validationSchemas = {
  user: {
    registration: userRegistrationSchema,
    login: userLoginSchema,
    profileUpdate: userProfileUpdateSchema,
    passwordChange: passwordChangeSchema
  },
  product: {
    create: productCreateSchema,
    update: productUpdateSchema
  },
  address: addressSchema,
  payment: {
    method: paymentMethodSchema,
    mobileMoney: mobileMoneyPaymentSchema
  },
  order: orderCreateSchema,
  search: searchFiltersSchema,
  supplier: supplierApplicationSchema,
  review: reviewSchema,
  contact: contactFormSchema,
  newsletter: newsletterSubscriptionSchema,
  api: apiConfigurationSchema
}

// Individual schemas are already exported above

export default validationSchemas 
