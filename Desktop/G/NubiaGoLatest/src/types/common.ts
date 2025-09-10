/**
 * Common Type Definitions
 * 
 * This file contains type definitions to replace TypeScript `any` types
 * throughout the codebase, improving type safety and reducing runtime errors.
 */

// ========================================
// ERROR HANDLING TYPES
// ========================================

export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
  stack?: string
}

export interface ValidationError extends AppError {
  field?: string
  value?: unknown
  validationType: 'required' | 'format' | 'length' | 'range' | 'custom'
}

export interface ApiError extends AppError {
  endpoint: string
  method: string
  response?: Response
  requestData?: unknown
}

// ========================================
// USER & AUTHENTICATION TYPES
// ========================================

export interface User {
  id?: string
  uid: string
  email: string
  name?: string
  displayName?: string
  photoURL?: string
  role: 'customer' | 'supplier' | 'admin'
  status?: string
  emailVerified?: boolean
  avatar?: string
  createdAt: Date
  updatedAt?: Date
  lastLogin?: Date
  isVerified?: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  language: string
  currency: string
  notifications: NotificationSettings
  theme: 'light' | 'dark' | 'auto'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  marketing: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AppError | null
}

// ========================================
// PRODUCT & CATALOG TYPES
// ========================================

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  currency: string
  category: string
  images: string[]
  imageUrl: string
  tags: string[]
  specifications: Record<string, string>
  inventory: number
  stock: number
  supplierId: string
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  image?: string
  parentId?: string
  children?: ProductCategory[]
  productCount: number
  isActive: boolean
}

export interface ProductSearchFilters {
  category?: string
  priceRange?: { min: number; max: number }
  rating?: number
  tags?: string[]
  supplier?: string
  availability?: 'in-stock' | 'out-of-stock' | 'pre-order'
  sortBy?: 'price' | 'rating' | 'name' | 'date' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductSearchResult {
  products: Product[]
  totalCount: number
  page: number
  pageSize: number
  filters: ProductSearchFilters
  suggestions?: string[]
}

// ========================================
// CART & ORDER TYPES
// ========================================

export interface CartItem {
  id: string
  productId: string
  product: import('./product').Product
  quantity: number
  price: number
  addedAt: Date
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  total: number
  itemCount: number
  updatedAt: Date
}

export interface OrderItem {
  id: string
  productId: string
  product: import('./product').Product
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingAddress: Address
  billingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'

// ========================================
// ADDRESS & SHIPPING TYPES
// ========================================

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export interface ShippingRate {
  id: string
  carrier: string
  service: string
  price: number
  currency: string
  estimatedDays: number
  isAvailable: boolean
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  currency: string
  estimatedDays: number
  restrictions?: string[]
}

// ========================================
// PAYMENT TYPES
// ========================================

export interface PaymentMethod {
  id: string
  type: 'credit-card' | 'debit-card' | 'bank-transfer' | 'mobile-money' | 'crypto'
  name: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  isActive: boolean
}

export interface PaymentTransaction {
  id: string
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  gateway: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

// ========================================
// NOTIFICATION & COMMUNICATION TYPES
// ========================================

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

export type NotificationType = 'order' | 'payment' | 'shipping' | 'promotion' | 'system' | 'security'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text: string
  variables: string[]
  isActive: boolean
}

// ========================================
// ANALYTICS & TRACKING TYPES
// ========================================

export interface AnalyticsEvent {
  id: string
  userId?: string
  sessionId: string
  type: string
  category: string
  action: string
  label?: string
  value?: number
  properties: Record<string, unknown>
  timestamp: Date
  userAgent: string
  ipAddress: string
}

export interface PageView {
  id: string
  userId?: string
  sessionId: string
  url: string
  title: string
  referrer?: string
  timestamp: Date
  duration?: number
}

// ========================================
// UTILITY TYPES
// ========================================

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

export interface LoggerOptions {
  level?: LogLevel
  context?: string
  production?: boolean
}

export interface CacheOptions {
  ttl: number
  maxSize: number
  compression?: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: AppError
  message?: string
  timestamp: Date
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ========================================
// FUNCTION TYPES
// ========================================

export type AnyFunction = (...args: unknown[]) => unknown
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>
export type EventHandler<T = Event> = (event: T) => void | Promise<void>
export type ErrorHandler = (error: AppError) => void | Promise<void>

// ========================================
// GENERIC TYPES
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

// ========================================
// VALIDATION TYPES
// ========================================

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: unknown
  message: string
  validator?: (value: unknown) => boolean | Promise<boolean>
}

export interface ValidationSchema {
  [field: string]: ValidationRule[]
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// ========================================
// CONFIGURATION TYPES
// ========================================

export interface AppConfig {
  environment: 'development' | 'staging' | 'production'
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  database: {
    url: string
    name: string
    poolSize: number
  }
  cache: {
    ttl: number
    maxSize: number
  }
  logging: {
    level: LogLevel
    enableConsole: boolean
    enableFile: boolean
    enableRemote: boolean
  }
}

// ========================================
// EXPORT ALL TYPES
// ========================================

// Note: AppError, ValidationError, and ApiError are exported from error-handler.ts
// to avoid circular dependencies and maintain proper separation of concerns
