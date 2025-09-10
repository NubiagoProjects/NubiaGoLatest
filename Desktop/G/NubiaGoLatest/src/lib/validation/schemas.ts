// Validation Schemas
// Centralized validation using Zod for consistent data validation

import { z } from 'zod'

// Base Schemas
export const baseSchemas = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  url: z.string().url('Invalid URL format'),
  date: z.string().datetime('Invalid date format'),
  boolean: z.boolean(),
  number: z.number(),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be a non-negative number'),
} as const

// User Schemas
export const userSchemas = {
  create: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters'),
    phoneNumber: baseSchemas.phone.optional(),
    role: z.enum(['customer', 'supplier', 'admin']).default('customer'),
  }),

  update: z.object({
    displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters').optional(),
    phoneNumber: baseSchemas.phone.optional(),
    photoURL: baseSchemas.url.optional(),
  }),

  profile: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
    dateOfBirth: baseSchemas.date.optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  }),
} as const

// Address Schemas
export const addressSchemas = {
  create: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
    address1: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be less than 200 characters'),
    address2: z.string().max(200, 'Address must be less than 200 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters'),
    state: z.string().min(2, 'State must be at least 2 characters').max(100, 'State must be less than 100 characters'),
    postalCode: z.string().min(3, 'Postal code must be at least 3 characters').max(20, 'Postal code must be less than 20 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country must be less than 100 characters'),
    phone: baseSchemas.phone,
    isDefault: z.boolean().default(false),
  }),

  update: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').optional(),
    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
    address1: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be less than 200 characters').optional(),
    address2: z.string().max(200, 'Address must be less than 200 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters').optional(),
    state: z.string().min(2, 'State must be at least 2 characters').max(100, 'State must be less than 100 characters').optional(),
    postalCode: z.string().min(3, 'Postal code must be at least 3 characters').max(20, 'Postal code must be less than 20 characters').optional(),
    country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country must be less than 100 characters').optional(),
    phone: baseSchemas.phone.optional(),
    isDefault: z.boolean().optional(),
  }),
} as const

// Product Schemas
export const productSchemas = {
  create: z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters').max(200, 'Product name must be less than 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
    price: baseSchemas.positiveNumber,
    originalPrice: baseSchemas.positiveNumber.optional(),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional(),
    brand: z.string().max(100, 'Brand must be less than 100 characters').optional(),
    sku: z.string().min(3, 'SKU must be at least 3 characters').max(50, 'SKU must be less than 50 characters'),
    stock: baseSchemas.nonNegativeNumber,
    tags: z.array(z.string().min(1, 'Tag cannot be empty')).max(20, 'Maximum 20 tags allowed'),
    specifications: z.record(z.any()).optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  }),

  update: z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters').max(200, 'Product name must be less than 200 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters').optional(),
    price: baseSchemas.positiveNumber.optional(),
    originalPrice: baseSchemas.positiveNumber.optional(),
    category: z.string().min(1, 'Category is required').optional(),
    subcategory: z.string().optional(),
    brand: z.string().max(100, 'Brand must be less than 100 characters').optional(),
    sku: z.string().min(3, 'SKU must be at least 3 characters').max(50, 'SKU must be less than 50 characters').optional(),
    stock: baseSchemas.nonNegativeNumber.optional(),
    tags: z.array(z.string().min(1, 'Tag cannot be empty')).max(20, 'Maximum 20 tags allowed').optional(),
    specifications: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),

  search: z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
    category: z.string().optional(),
    minPrice: baseSchemas.nonNegativeNumber.optional(),
    maxPrice: baseSchemas.positiveNumber.optional(),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
    brand: z.array(z.string()).optional(),
    availability: z.enum(['in-stock', 'out-of-stock']).optional(),
    sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'rating', 'newest']).optional(),
    page: baseSchemas.nonNegativeNumber.default(1),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
  }),
} as const

// Category Schemas
export const categorySchemas = {
  create: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100, 'Category name must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    parentId: baseSchemas.id.optional(),
    isActive: z.boolean().default(true),
    order: baseSchemas.nonNegativeNumber.default(0),
  }),

  update: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100, 'Category name must be less than 100 characters').optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    parentId: baseSchemas.id.optional(),
    isActive: z.boolean().optional(),
    order: baseSchemas.nonNegativeNumber.optional(),
  }),
} as const

// Order Schemas
export const orderSchemas = {
  create: z.object({
    items: z.array(z.object({
      productId: baseSchemas.id,
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: baseSchemas.positiveNumber,
    })).min(1, 'At least one item is required'),
    shippingAddress: addressSchemas.create,
    billingAddress: addressSchemas.create.optional(),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  }),

  update: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    trackingNumber: z.string().optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  }),
} as const

// Review Schemas
export const reviewSchemas = {
  create: z.object({
    productId: baseSchemas.id,
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
    images: z.array(baseSchemas.url).max(5, 'Maximum 5 images allowed').optional(),
  }),

  update: z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters').optional(),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters').optional(),
    images: z.array(baseSchemas.url).max(5, 'Maximum 5 images allowed').optional(),
  }),
} as const

// Payment Schemas
export const paymentSchemas = {
  creditCard: z.object({
    cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
    expiryMonth: z.number().min(1, 'Expiry month must be between 1 and 12').max(12, 'Expiry month must be between 1 and 12'),
    expiryYear: z.number().min(new Date().getFullYear(), 'Expiry year must be in the future'),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
    cardholderName: z.string().min(2, 'Cardholder name must be at least 2 characters').max(100, 'Cardholder name must be less than 100 characters'),
  }),

  mobileMoney: z.object({
    provider: z.string().min(1, 'Provider is required'),
    phoneNumber: baseSchemas.phone,
    amount: baseSchemas.positiveNumber,
    currency: z.string().length(3, 'Currency must be 3 characters').default('NGN'),
  }),
} as const

// File Upload Schemas
export const fileSchemas = {
  image: z.object({
    file: z.instanceof(File),
    maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
    allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  }),

  document: z.object({
    file: z.instanceof(File),
    maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
    allowedTypes: z.array(z.string()).default(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  }),
} as const

// API Schemas
export const apiSchemas = {
  pagination: z.object({
    page: baseSchemas.nonNegativeNumber.default(1),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  response: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }).optional(),
  }),
} as const

// Export all schemas
export const schemas = {
  base: baseSchemas,
  user: userSchemas,
  address: addressSchemas,
  product: productSchemas,
  category: categorySchemas,
  order: orderSchemas,
  review: reviewSchemas,
  payment: paymentSchemas,
  file: fileSchemas,
  api: apiSchemas,
} as const

export default schemas
