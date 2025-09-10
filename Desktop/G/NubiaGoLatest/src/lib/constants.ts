// Application Constants
export const APP_NAME = 'NubiaGo'
export const APP_DESCRIPTION = 'Africa\'s Premier Marketplace'
export const APP_URL = 'https://nubiago.com'

// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Configuration (Database removed)
export const APP_CONFIG = {
  name: 'NubiaGo',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
}

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'laptop' },
  { id: 'fashion', name: 'Fashion', icon: 'shirt' },
  { id: 'home-living', name: 'Home & Living', icon: 'home' },
  { id: 'health-wellness', name: 'Health & Wellness', icon: 'heart' },
  { id: 'sports', name: 'Sports & Outdoors', icon: 'activity' },
  { id: 'books', name: 'Books & Media', icon: 'book' },
  { id: 'automotive', name: 'Automotive', icon: 'car' },
  { id: 'beauty', name: 'Beauty & Personal Care', icon: 'scissors' },
]

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// Pagination
export const ITEMS_PER_PAGE = 12
export const MAX_PAGES_TO_SHOW = 5

// Currency
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  NAME: 'US Dollar',
}

// Shipping
export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Delivery', price: 500, days: '3-5' },
  { id: 'express', name: 'Express Delivery', price: 1000, days: '1-2' },
  { id: 'same-day', name: 'Same Day Delivery', price: 2000, days: 'Same day' },
]

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'support@nubiago.com',
  PHONE: '+234 123 456 7890',
  ADDRESS: '123 Innovation Drive, Victoria Island, Lagos, Nigeria',
  BUSINESS_HOURS: 'Monday - Friday: 8:00 AM - 6:00 PM',
}

// Social Media
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/nubiago',
  TWITTER: 'https://twitter.com/nubiago',
  INSTAGRAM: 'https://instagram.com/nubiago',
  LINKEDIN: 'https://linkedin.com/company/nubiago',
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_SENT: 'Email sent successfully!',
}

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
}

// Cache Keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USER_PROFILE: 'user_profile',
  CART: 'cart',
  WISHLIST: 'wishlist',
}

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_REVIEWS: true,
  ENABLE_WISHLIST: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
}

// Analytics Events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  WISHLIST_DATA: 'wishlist_data',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
}

// Colors
export const COLORS = {
  PRIMARY: '#0F52BA',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
}

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
}

// Category and Subcategory definitions
export const CATEGORIES_DATA = [
  {
    name: 'Women',
    value: 'women',
    subcategories: [
      { name: 'Dresses', value: 'women-dresses' },
      { name: 'T-Shirts', value: 'women-tshirts' },
      { name: 'Jeans', value: 'women-jeans' },
      { name: 'Shoes', value: 'women-shoes' },
      { name: 'Bags', value: 'women-bags' }
    ]
  },
  {
    name: 'Men',
    value: 'men',
    subcategories: [
      { name: 'Shirts', value: 'men-shirts' },
      { name: 'T-Shirts', value: 'men-tshirts' },
      { name: 'Jeans', value: 'men-jeans' },
      { name: 'Shoes', value: 'men-shoes' },
      { name: 'Accessories', value: 'men-accessories' }
    ]
  },
  {
    name: 'Electronics',
    value: 'electronics',
    subcategories: [
      { name: 'Smartphones', value: 'smartphones' },
      { name: 'Laptops', value: 'laptops' },
      { name: 'Tablets', value: 'tablets' },
      { name: 'Audio', value: 'audio' },
      { name: 'Gaming', value: 'gaming' }
    ]
  },
  {
    name: 'Home & Living',
    value: 'home-living',
    subcategories: [
      { name: 'Furniture', value: 'furniture' },
      { name: 'Kitchen', value: 'kitchen' },
      { name: 'Decor', value: 'decor' },
      { name: 'Bedding', value: 'bedding' },
      { name: 'Lighting', value: 'lighting' }
    ]
  },
  {
    name: 'Beauty & Cosmetics',
    value: 'beauty-cosmetics',
    subcategories: [
      { name: 'Skincare', value: 'skincare' },
      { name: 'Makeup', value: 'makeup' },
      { name: 'Hair Care', value: 'hair-care' },
      { name: 'Fragrances', value: 'fragrances' },
      { name: 'Nail Care', value: 'nail-care' }
    ]
  },
  {
    name: 'Shoes & Bags',
    value: 'shoes-bags',
    subcategories: [
      { name: 'Women\'s Shoes', value: 'womens-shoes' },
      { name: 'Men\'s Shoes', value: 'mens-shoes' },
      { name: 'Handbags', value: 'handbags' },
      { name: 'Backpacks', value: 'backpacks' },
      { name: 'Wallets', value: 'wallets' }
    ]
  },
  {
    name: 'Mother & Child',
    value: 'mother-child',
    subcategories: [
      { name: 'Maternity Wear', value: 'maternity-wear' },
      { name: 'Baby Clothing', value: 'baby-clothing' },
      { name: 'Kids Clothing', value: 'kids-clothing' },
      { name: 'Baby Care', value: 'baby-care' },
      { name: 'Kids Toys', value: 'kids-toys' }
    ]
  }
]

// Helper functions
export const getCategoryByValue = (value: string) => {
  return CATEGORIES_DATA.find(category => category.value === value)
}

export const getSubcategoryByValue = (categoryValue: string, subcategoryValue: string) => {
  const category = getCategoryByValue(categoryValue)
  return category?.subcategories.find(sub => sub.value === subcategoryValue)
}

export const getAllSubcategories = () => {
  return CATEGORIES_DATA.flatMap(category => 
    category.subcategories.map(sub => ({
      ...sub,
      categoryName: category.name,
      categoryValue: category.value
    }))
  )
}

export const getSubcategoriesByCategory = (categoryValue: string) => {
  const category = getCategoryByValue(categoryValue)
  return category?.subcategories || []
} 
