// Application Routes Configuration
// Centralized routing for better maintainability and consistency

export const ROUTES = {
  // Public Routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  HELP: '/help',
  BLOG: '/blog',
  CAREERS: '/careers',
  PRESS: '/press',
  PARTNER_PROGRAM: '/partner-program',
  ENTERPRISE: '/enterprise',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  COOKIES: '/cookies',
  GDPR: '/gdpr',
  
  // Authentication Routes
  AUTH: {
    LOGIN: '/auth',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ACCOUNT_SUSPENDED: '/account-suspended',
    UNAUTHORIZED: '/unauthorized',
  },
  
  // Product Routes
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products/create',
    NEW: '/products/new',
    OFFLINE: '/products/offline',
    DETAIL: (slug: string) => `/products/${slug}`,
    EDIT: (id: string) => `/products/${id}/edit`,
    CATEGORY: (slug: string) => `/categories/${slug}`,
    SEARCH: '/search',
  },
  
  // Cart & Checkout Routes
  CART: '/cart',
  CHECKOUT: {
    MAIN: '/checkout',
    SUCCESS: '/checkout/success',
    FAILED: '/checkout/failed',
  },
  
  // User Account Routes
  ACCOUNT: {
    PROFILE: '/profile',
    DASHBOARD: '/dashboard',
    ORDERS: '/orders',
    WISHLIST: '/wishlist',
    NOTIFICATIONS: '/notifications',
    PAYMENT_METHODS: '/payment-methods',
    SETTINGS: '/settings',
    SUPPORT: '/support',
  },
  
  // Order Routes
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    TRACK: (id: string) => `/order/track/${id}`,
    CONFIRMATION: (id: string) => `/order/confirmation/${id}`,
    SUCCESS: '/orders/success',
  },
  
  // Payment Routes
  PAYMENT: {
    SUCCESS: '/payment/success',
  },
  
  // Shipping Routes
  SHIPPING: '/shipping',
  RETURNS: '/returns',
  
  // Supplier Routes
  SUPPLIER: {
    DASHBOARD: '/supplier',
    PRODUCTS: '/supplier/products',
    BULK_UPLOAD: '/supplier/products/bulk-upload',
    CREATE: '/supplier/products/create',
    SHIPPING: '/supplier/shipping',
    CHAT: '/supplier/chat',
    PENDING_APPROVAL: '/supplier/pending-approval',
    BECOME_SUPPLIER: '/become-supplier',
  },
  
  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    USER_EDIT: (id: string) => `/admin/users/${id}/edit`,
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    SUPPLIERS: '/admin/suppliers',
    APPROVALS: '/admin/approvals',
    APIS: '/admin/apis',
    IMAGES: '/admin/images',
    MONITORING: '/admin/monitoring',
    SETTINGS: '/admin/settings',
  },
  
  // API Routes
  API: {
    PRODUCTS: '/api/products',
    PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
    CATEGORIES: '/api/categories',
    SHIPPING_RATES: '/api/shipping/rates',
    SHIPPING_TRACKING: '/api/shipping/tracking',
    MOBILE_MONEY: {
      INITIATE: '/api/mobile-money/initiate',
      OPERATORS: (country: string) => `/api/mobile-money/operators/${country}`,
      STATUS: (paymentId: string) => `/api/mobile-money/status/${paymentId}`,
      WEBHOOK: '/api/mobile-money/webhook',
    },
  },
  
  // Documentation Routes
  API_DOCS: '/api-docs',
  
  // Audit Routes
  AUDIT: '/audit',
  AUDIT_DASHBOARD: '/audit-dashboard',
  
  // Chat Routes
  CHAT: '/chat',
  
  // Test Routes
  TEST: {
    CONNECTION: '/test-connection',
    EMAIL_VERIFICATION: '/test-email-verification',
    MOCK: '/test-mock',
  },
} as const

// Route Groups for better organization
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.FAQ,
    ROUTES.HELP,
    ROUTES.BLOG,
    ROUTES.CAREERS,
    ROUTES.PRESS,
    ROUTES.PARTNER_PROGRAM,
    ROUTES.ENTERPRISE,
    ROUTES.TERMS,
    ROUTES.PRIVACY,
    ROUTES.COOKIES,
    ROUTES.GDPR,
  ],
  
  AUTH_REQUIRED: [
    ROUTES.ACCOUNT.PROFILE,
    ROUTES.ACCOUNT.DASHBOARD,
    ROUTES.ACCOUNT.ORDERS,
    ROUTES.ACCOUNT.WISHLIST,
    ROUTES.ACCOUNT.NOTIFICATIONS,
    ROUTES.ACCOUNT.PAYMENT_METHODS,
    ROUTES.ACCOUNT.SETTINGS,
    ROUTES.ACCOUNT.SUPPORT,
    ROUTES.CART,
    ROUTES.CHECKOUT.MAIN,
  ],
  
  SUPPLIER_REQUIRED: [
    ROUTES.SUPPLIER.DASHBOARD,
    ROUTES.SUPPLIER.PRODUCTS,
    ROUTES.SUPPLIER.BULK_UPLOAD,
    ROUTES.SUPPLIER.CREATE,
    ROUTES.SUPPLIER.SHIPPING,
    ROUTES.SUPPLIER.CHAT,
  ],
  
  ADMIN_REQUIRED: [
    ROUTES.ADMIN.DASHBOARD,
    ROUTES.ADMIN.USERS,
    ROUTES.ADMIN.PRODUCTS,
    ROUTES.ADMIN.ORDERS,
    ROUTES.ADMIN.SUPPLIERS,
    ROUTES.ADMIN.APPROVALS,
    ROUTES.ADMIN.APIS,
    ROUTES.ADMIN.IMAGES,
    ROUTES.ADMIN.MONITORING,
    ROUTES.ADMIN.SETTINGS,
  ],
} as const

// Navigation structure for consistent UI
export const NAVIGATION = {
  MAIN: [
    { label: 'Home', href: ROUTES.HOME },
    { label: 'Products', href: ROUTES.PRODUCTS.LIST },
    { label: 'Categories', href: ROUTES.PRODUCTS.CATEGORY('all') },
    { label: 'About', href: ROUTES.ABOUT },
    { label: 'Contact', href: ROUTES.CONTACT },
  ],
  
  FOOTER: [
    { label: 'Company', items: [
      { label: 'About Us', href: ROUTES.ABOUT },
      { label: 'Careers', href: ROUTES.CAREERS },
      { label: 'Press', href: ROUTES.PRESS },
      { label: 'Partner Program', href: ROUTES.PARTNER_PROGRAM },
    ]},
    { label: 'Support', items: [
      { label: 'Help Center', href: ROUTES.HELP },
      { label: 'Contact Us', href: ROUTES.CONTACT },
      { label: 'FAQ', href: ROUTES.FAQ },
      { label: 'Returns', href: ROUTES.RETURNS },
    ]},
    { label: 'Legal', items: [
      { label: 'Terms of Service', href: ROUTES.TERMS },
      { label: 'Privacy Policy', href: ROUTES.PRIVACY },
      { label: 'Cookie Policy', href: ROUTES.COOKIES },
      { label: 'GDPR', href: ROUTES.GDPR },
    ]},
  ],
} as const

export default ROUTES
