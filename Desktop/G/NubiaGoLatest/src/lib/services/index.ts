// Services - Centralized exports for better organization

// Core Services (only export services that actually exist)
export { apiService } from './api.service'
export { analyticsService } from './analytics.service'
export { auditService } from './audit.service'
export { authService } from './auth.service'
export { cartService } from './cart.service'
export { errorLogger } from './error-logging.service'
export { logisticsService } from './logistics.service'
export { orderService } from './order.service'
export { productService } from './product.service'
export { searchService } from './search.service'
export { storageService } from './storage.service'
export { userService } from './user.service'
export { wishlistService } from './wishlist.service'

// Admin Services
export { AdminOrderService } from './admin/admin-order.service'
export { AdminProductService } from './admin/admin-product.service'
export { AdminSupplierService } from './admin/admin-supplier.service'
export { AdminUserService } from './admin/admin-user.service'

// External Services
export { emailService } from './email.service'
export { mobileMoneyService } from './mobile-money.service'

// Utility Services
export { performanceService } from './performance.service'
export { EdgeUserService } from './edge-user.service'
