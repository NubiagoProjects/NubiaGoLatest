// Custom Hooks - Centralized exports for better organization

// Core Hooks
export { useAuth } from './useAuth'
export { useFirebaseAuth } from './useFirebaseAuth'
export { useCSRF } from './useCSRF'
export { useDebounce } from './useDebounce'
export { useFormAutoSave } from './useFormAutoSave'
export { useImageUpload } from './useImageUpload'
export { useInfiniteScroll } from './useInfiniteScroll'
export { useLogistics } from './useLogistics'
export { useNetworkStatus } from './useNetworkStatus'
export { usePWA } from './usePWA'
export { useRoleChange } from './useRoleChange'

// Store Hooks
export { useCartStore } from './useCartStore'
export { useWishlistStore } from './useWishlistStore'

// Note: Only export hooks that actually exist as files
// Commented out non-existent hooks to prevent build errors
// export { useProductSearch } from './useProductSearch'
// export { useProductFilter } from './useProductFilter'
// export { useCheckout } from './useCheckout'
// export { usePayment } from './usePayment'
// export { useShipping } from './useShipping'
// export { useNotifications } from './useNotifications'
// export { useChat } from './useChat'
// export { useAnalytics } from './useAnalytics'
// export { useLocalStorage } from './useLocalStorage'
// export { useSessionStorage } from './useSessionStorage'
// export { useMediaQuery } from './useMediaQuery'
// export { useIntersectionObserver } from './useIntersectionObserver'
// export { useClickOutside } from './useClickOutside'
// export { useKeyboard } from './useKeyboard'
// export { useScrollPosition } from './useScrollPosition'
// export { useWindowSize } from './useWindowSize'
