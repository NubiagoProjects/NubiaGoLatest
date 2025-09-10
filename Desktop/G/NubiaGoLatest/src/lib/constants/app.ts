// Application Constants
// Centralized configuration for better maintainability

export const APP_CONFIG = {
  // Application Information
  NAME: 'HomeBase',
  DESCRIPTION: 'Find what you need, faster!',
  VERSION: '1.0.0',
  AUTHOR: 'HomeBase Team',
  LICENSE: 'MIT',
  
  // URLs and Domains
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://home-base-one.vercel.app',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.homebase.com',
  
  // Contact Information
  CONTACT: {
    EMAIL: 'support@homebase.com',
    PHONE: '+234-XXX-XXX-XXXX',
    ADDRESS: 'Lagos, Nigeria',
    BUSINESS_HOURS: 'Mon-Fri: 9AM-6PM WAT',
  },
  
  // Social Media
  SOCIAL: {
    TWITTER: '@homebase',
    FACEBOOK: 'homebase',
    INSTAGRAM: 'homebase',
    LINKEDIN: 'homebase',
    YOUTUBE: 'homebase',
  },
  
  // Business Information
  BUSINESS: {
    COMPANY_NAME: 'HomeBase Technologies Ltd',
    REGISTRATION_NUMBER: 'RC123456',
    TAX_ID: '123456789',
    VAT_NUMBER: 'NG123456789',
  },
} as const

export const FEATURE_FLAGS = {
  // Feature Toggles
  ENABLE_CHAT: true,
  ENABLE_MOBILE_MONEY: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PWA: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_PRODUCT_REVIEWS: true,
  ENABLE_WISHLIST: true,
  ENABLE_SUPPLIER_FEATURES: true,
  ENABLE_ADMIN_FEATURES: true,
} as const

export const UI_CONFIG = {
  // UI Configuration
  THEME: {
    PRIMARY_COLOR: '#0F52BA',
    SECONDARY_COLOR: '#FF6B35',
    SUCCESS_COLOR: '#10B981',
    WARNING_COLOR: '#F59E0B',
    ERROR_COLOR: '#EF4444',
    INFO_COLOR: '#3B82F6',
  },
  
  // Layout
  LAYOUT: {
    MAX_WIDTH: '1280px',
    CONTAINER_PADDING: '1rem',
    HEADER_HEIGHT: '64px',
    FOOTER_HEIGHT: 'auto',
    SIDEBAR_WIDTH: '280px',
  },
  
  // Responsive Breakpoints
  BREAKPOINTS: {
    MOBILE: '640px',
    TABLET: '768px',
    DESKTOP: '1024px',
    WIDE: '1280px',
    ULTRA_WIDE: '1536px',
  },
  
  // Animation
  ANIMATION: {
    DURATION: {
      FAST: '150ms',
      NORMAL: '300ms',
      SLOW: '500ms',
    },
    EASING: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const

export const API_CONFIG = {
  // API Configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
    BURST_LIMIT: 10,
  },
  
  // Caching
  CACHE: {
    TTL: 300, // 5 minutes
    MAX_ITEMS: 1000,
    STALE_WHILE_REVALIDATE: 60, // 1 minute
  },
} as const

export const SECURITY_CONFIG = {
  // Security Configuration
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  
  SESSION: {
    TIMEOUT: 3600000, // 1 hour
    REFRESH_THRESHOLD: 300000, // 5 minutes
    MAX_CONCURRENT_SESSIONS: 3,
  },
  
  CSRF: {
    TOKEN_LENGTH: 32,
    EXPIRY: 3600000, // 1 hour
  },
  
  RATE_LIMITING: {
    LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900000, // 15 minutes
    RESET_ATTEMPTS: 3,
  },
} as const

export const PERFORMANCE_CONFIG = {
  // Performance Configuration
  IMAGE_OPTIMIZATION: {
    QUALITY: 80,
    FORMATS: ['webp', 'avif', 'jpeg'],
    SIZES: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    PLACEHOLDER_BLUR: 10,
  },
  
  BUNDLE_OPTIMIZATION: {
    CHUNK_SIZE_LIMIT: 244000, // 244KB
    ENABLE_TREE_SHAKING: true,
    ENABLE_CODE_SPLITTING: true,
    ENABLE_LAZY_LOADING: true,
  },
  
  CACHING: {
    STATIC_ASSETS: 31536000, // 1 year
    API_RESPONSES: 300, // 5 minutes
    USER_PREFERENCES: 86400, // 1 day
  },
} as const

export const LOCALIZATION_CONFIG = {
  // Localization Configuration
  DEFAULT_LOCALE: 'en',
  SUPPORTED_LOCALES: ['en', 'fr', 'ar', 'sw'],
  
  CURRENCIES: {
    DEFAULT: 'NGN',
    SUPPORTED: ['NGN', 'USD', 'EUR', 'GBP', 'GHS', 'KES', 'ZAR'],
  },
  
  TIMEZONES: {
    DEFAULT: 'Africa/Lagos',
    SUPPORTED: [
      'Africa/Lagos',
      'Africa/Cairo',
      'Africa/Johannesburg',
      'Africa/Nairobi',
      'Africa/Accra',
    ],
  },
} as const

const appConstants = {
  APP_CONFIG,
  FEATURE_FLAGS,
  UI_CONFIG,
  API_CONFIG,
  SECURITY_CONFIG,
  PERFORMANCE_CONFIG,
  LOCALIZATION_CONFIG,
}

export default appConstants
