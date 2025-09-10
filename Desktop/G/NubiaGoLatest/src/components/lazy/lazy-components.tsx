import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'

// ============================================================================
// PERFORMANCE OPTIMIZED LAZY COMPONENTS
// ============================================================================

// Loading components with skeleton screens
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
)

const LoadingCard = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
)

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <LoadingCard key={i} />
    ))}
  </div>
)

// ============================================================================
// LAZY-LOADED COMPONENTS WITH DYNAMIC IMPORTS
// ============================================================================

// Product components
export const LazyProductSearch = dynamic(
  () => import('@/components/product/product-search'),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
)

export const LazyAdvancedSearch = dynamic(
  () => import('@/components/product/advanced-search').then(mod => ({ default: mod.AdvancedSearch })),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyProductReviews = dynamic(
  () => import('@/components/product/product-reviews'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

// Shopping components
export const LazyShoppingCart = dynamic(
  () => import('@/components/cart/shopping-cart'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyWishlist = dynamic(
  () => import('@/components/wishlist/wishlist'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

// Communication components
export const LazyChatInterface = dynamic(
  () => import('@/components/chat/chat-interface'),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
)

// Payment components
export const LazyPaymentForm = dynamic(
  () => import('@/components/payment/payment-form').then(mod => ({ default: mod.PaymentForm })),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyPaymentMethodSelector = dynamic(
  () => import('@/components/payment/payment-method-selector').then(mod => ({ default: mod.PaymentMethodSelector })),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

// Shipping components
export const LazyShippingCalculator = dynamic(
  () => import('@/components/shipping/shipping-calculator').then(mod => ({ default: mod.ShippingCalculator })),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyTrackingWidget = dynamic(
  () => import('@/components/shipping/tracking-widget').then(mod => ({ default: mod.TrackingWidget })),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

// UI components
export const LazyFileUpload = dynamic(
  () => import('@/components/ui/file-upload'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyImageUpload = dynamic(
  () => import('@/components/ui/image-upload').then(mod => ({ default: mod.ImageUpload })),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyModal = dynamic(
  () => import('@/components/ui/modal').then(mod => ({ default: mod.Modal })),
  {
    loading: () => null,
    ssr: false,
  }
)

export const LazyToast = dynamic(
  () => import('@/components/ui/toast').then(mod => ({ default: mod.ToastProvider })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Customer components
export const LazyCustomerProfile = dynamic(
  () => import('@/components/customer/customer-profile'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

// Auth components
export const LazyLoginForm = dynamic(
  () => import('@/components/auth/login-form'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyRegisterForm = dynamic(
  () => import('@/components/auth/register-form'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

export const LazyUserProfile = dynamic(
  () => import('@/components/auth/user-profile'),
  {
    loading: LoadingCard,
    ssr: false,
  }
)

// ============================================================================
// PERFORMANCE OPTIMIZED HOOKS
// ============================================================================

// Hook for lazy loading with intersection observer
export function useLazyLoad<T>(
  importFn: () => Promise<T>,
  options: IntersectionObserverInit = {}
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !Component && !isLoading) {
          setIsLoading(true)
          try {
            const loadedModule = await importFn()
            setComponent(loadedModule)
          } catch (err) {
            setError(err as Error)
          } finally {
            setIsLoading(false)
          }
        }
      },
      { threshold: 0.1, rootMargin: '50px', ...options }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [Component, isLoading, importFn, options])

  return { ref, Component, isLoading, error }
}

// Hook for conditional lazy loading
export function useConditionalLazyLoad<T>(
  importFn: () => Promise<T>,
  condition: boolean
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (condition && !Component && !isLoading) {
      setIsLoading(true)
      importFn()
        .then((module) => {
          setComponent(module)
        })
        .catch((err) => {
          setError(err as Error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [condition, Component, isLoading, importFn])

  return { Component, isLoading, error }
}

// Hook for progressive loading
export function useProgressiveLoad<T>(
  items: T[],
  batchSize: number = 10,
  delay: number = 100
) {
  const [loadedItems, setLoadedItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, delay))

    const currentLength = loadedItems.length
    const newItems = items.slice(currentLength, currentLength + batchSize)
    
    setLoadedItems(prev => [...prev, ...newItems])
    setHasMore(currentLength + batchSize < items.length)
    setIsLoading(false)
  }

  useEffect(() => {
    if (items.length > 0 && loadedItems.length === 0) {
      loadMore()
    }
  }, [items])

  return { loadedItems, isLoading, hasMore, loadMore }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const startTime = useRef(performance.now())
    const renderCount = useRef(0)

    useEffect(() => {
      renderCount.current++
      const endTime = performance.now()
      const renderTime = endTime - startTime.current

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`)
      }

      startTime.current = performance.now()
    })

    return <Component {...props} />
  }
}

// ============================================================================
// EXPORT ALL LAZY COMPONENTS
// ============================================================================

export const LazyComponents = {
  // Product
  ProductSearch: LazyProductSearch,
  AdvancedSearch: LazyAdvancedSearch,
  ProductReviews: LazyProductReviews,
  
  // Shopping
  ShoppingCart: LazyShoppingCart,
  Wishlist: LazyWishlist,
  
  // Communication
  ChatInterface: LazyChatInterface,
  
  // Payment
  PaymentForm: LazyPaymentForm,
  PaymentMethodSelector: LazyPaymentMethodSelector,
  
  // Shipping
  ShippingCalculator: LazyShippingCalculator,
  TrackingWidget: LazyTrackingWidget,
  
  // UI
  FileUpload: LazyFileUpload,
  ImageUpload: LazyImageUpload,
  Modal: LazyModal,
  Toast: LazyToast,
  
  // Customer
  CustomerProfile: LazyCustomerProfile,
  
  // Auth
  LoginForm: LazyLoginForm,
  RegisterForm: LazyRegisterForm,
  UserProfile: LazyUserProfile,
} 
