# NubiaGo UX Optimization System - Usage Examples & Best Practices

## Quick Start Examples

### 1. Basic Error Boundary Integration

```tsx
// pages/products/page.tsx
import { EnhancedErrorBoundary } from '@/components/ui/error-boundary'
import { ProductGrid } from '@/components/product/product-grid'

export default function ProductsPage() {
  return (
    <EnhancedErrorBoundary
      fallback="Failed to load products"
      onError={(error) => console.log('Products error:', error)}
    >
      <ProductGrid />
    </EnhancedErrorBoundary>
  )
}
```

### 2. Smart Lazy Loading Implementation

```tsx
// components/product/ProductCard.tsx
import { SmartLazyLoader } from '@/components/lazy/smart-lazy-loader'
import { PerformanceOptimizedImage } from '@/components/optimized/PerformanceOptimizedImage'

export function ProductCard({ product }) {
  return (
    <SmartLazyLoader
      threshold={0.1}
      rootMargin="50px"
      fallback={<ProductCardSkeleton />}
    >
      <div className="product-card">
        <PerformanceOptimizedImage
          src={product.images[0]}
          alt={product.name}
          width={300}
          height={300}
          priority={false}
        />
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    </SmartLazyLoader>
  )
}
```

### 3. Network-Aware Optimization Hook

```tsx
// components/search/ProductSearch.tsx
import { useNetworkAwareOptimization } from '@/hooks/useNetworkAwareOptimization'
import { useDebounce } from '@/hooks/useDebounce'

export function ProductSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { imageQuality, batchSize, enableAnimations } = useNetworkAwareOptimization()

  const searchProducts = async () => {
    const results = await fetch('/api/products/search', {
      method: 'POST',
      body: JSON.stringify({
        query: debouncedQuery,
        limit: batchSize,
        imageQuality
      })
    })
    return results.json()
  }

  return (
    <div className={`search-container ${!enableAnimations ? 'no-animations' : ''}`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      {/* Search results with network-aware loading */}
    </div>
  )
}
```

## Advanced Usage Patterns

### 1. Custom Performance Budget Configuration

```tsx
// lib/config/performance-config.ts
import { performanceBudgetManager } from '@/lib/utils/performance-budget'

// Configure custom budgets for different pages
performanceBudgetManager.setBudget('homepage', {
  lcp: 2000,
  fid: 80,
  cls: 0.08,
  memory: 40,
  resourceCount: 50,
  resourceSize: 2000000 // 2MB
})

performanceBudgetManager.setBudget('product-detail', {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  memory: 60,
  resourceCount: 80,
  resourceSize: 3000000 // 3MB
})

// Set up violation handlers
performanceBudgetManager.onViolation((violation) => {
  // Send to analytics
  analytics.track('performance_violation', violation)
  
  // Log for debugging
  console.warn('Performance budget exceeded:', violation)
  
  // Trigger optimization strategies
  if (violation.metric === 'memory' && violation.actual > 100) {
    // Clear caches, reduce image quality, etc.
    optimizationStrategies.reduceMemoryUsage()
  }
})
```

### 2. Adaptive Loading Strategy

```tsx
// components/catalog/AdaptiveProductCatalog.tsx
import { usePerformance } from '@/components/providers/performance-provider'
import { AdaptiveSkeleton } from '@/components/ui/adaptive-loading-skeleton'

export function AdaptiveProductCatalog({ products }) {
  const { performanceScore, networkInfo } = usePerformance()
  
  // Adapt loading strategy based on performance
  const getLoadingStrategy = () => {
    if (performanceScore < 50 || networkInfo?.effectiveType === 'slow-2g') {
      return {
        batchSize: 6,
        imageQuality: 'low',
        enableAnimations: false,
        skeletonComplexity: 'simple'
      }
    } else if (performanceScore < 80 || networkInfo?.effectiveType === '2g') {
      return {
        batchSize: 12,
        imageQuality: 'medium',
        enableAnimations: true,
        skeletonComplexity: 'medium'
      }
    } else {
      return {
        batchSize: 24,
        imageQuality: 'high',
        enableAnimations: true,
        skeletonComplexity: 'detailed'
      }
    }
  }

  const strategy = getLoadingStrategy()

  return (
    <div className="product-catalog">
      <Suspense fallback={
        <AdaptiveSkeleton 
          type="product-grid" 
          count={strategy.batchSize}
          complexity={strategy.skeletonComplexity}
        />
      }>
        <ProductGrid 
          products={products}
          batchSize={strategy.batchSize}
          imageQuality={strategy.imageQuality}
          enableAnimations={strategy.enableAnimations}
        />
      </Suspense>
    </div>
  )
}
```

### 3. Error Recovery Strategies

```tsx
// components/resilient/ResilientComponent.tsx
import { EnhancedErrorBoundary } from '@/components/ui/error-boundary'

export function ResilientComponent({ children }) {
  const handleError = async (error, errorInfo, retry) => {
    // Log error with context
    errorLogger.error('Component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })

    // Implement recovery strategies
    if (error.message.includes('ChunkLoadError')) {
      // Handle dynamic import failures
      console.log('Chunk load error detected, clearing cache and retrying...')
      await clearModuleCache()
      setTimeout(retry, 1000)
    } else if (error.message.includes('Network')) {
      // Handle network errors
      console.log('Network error detected, retrying with exponential backoff...')
      await waitForNetwork()
      setTimeout(retry, 2000)
    } else {
      // Generic error recovery
      console.log('Generic error, attempting component remount...')
      setTimeout(retry, 500)
    }
  }

  return (
    <EnhancedErrorBoundary
      onError={handleError}
      maxRetries={3}
      retryDelay={1000}
      fallback={({ error, retry, goBack, goHome }) => (
        <div className="error-recovery-ui">
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <div className="error-actions">
            <button onClick={retry}>Try Again</button>
            <button onClick={goBack}>Go Back</button>
            <button onClick={goHome}>Go Home</button>
          </div>
        </div>
      )}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}
```

## Mobile Optimization Examples

### 1. Mobile-First Lazy Loading

```tsx
// components/mobile/MobileProductList.tsx
import { OptimizedMobileLayout } from '@/components/optimized/OptimizedMobileLayout'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export function MobileProductList() {
  const {
    data: products,
    loading,
    error,
    hasMore,
    loadMore
  } = useInfiniteScroll('/api/products', {
    initialBatchSize: 10,
    batchSize: 5, // Smaller batches for mobile
    threshold: 0.8
  })

  return (
    <OptimizedMobileLayout
      enablePullToRefresh
      onRefresh={async () => {
        // Refresh product list
        await refetchProducts()
      }}
    >
      <div className="mobile-product-list">
        {products.map((product, index) => (
          <SmartLazyLoader
            key={product.id}
            threshold={0.2} // Load earlier on mobile
            rootMargin="100px" // Larger margin for mobile
            fallback={<MobileProductCardSkeleton />}
          >
            <MobileProductCard 
              product={product}
              priority={index < 3} // Prioritize first 3 items
            />
          </SmartLazyLoader>
        ))}
        
        {loading && <MobileLoadingSpinner />}
        {error && <MobileErrorMessage onRetry={loadMore} />}
      </div>
    </OptimizedMobileLayout>
  )
}
```

### 2. Touch-Optimized Interactions

```tsx
// components/mobile/TouchOptimizedButton.tsx
import { useNetworkAwareOptimization } from '@/hooks/useNetworkAwareOptimization'

export function TouchOptimizedButton({ 
  children, 
  onClick, 
  loading = false,
  ...props 
}) {
  const { enableAnimations } = useNetworkAwareOptimization()
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    setIsPressed(true)
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
  }

  return (
    <button
      className={`
        touch-optimized-button
        min-h-[44px] min-w-[44px] // Minimum touch target
        ${isPressed ? 'pressed' : ''}
        ${!enableAnimations ? 'no-animations' : ''}
        ${loading ? 'loading' : ''}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}
```

## Performance Monitoring Integration

### 1. Custom Performance Metrics

```tsx
// hooks/usePerformanceTracking.ts
import { usePerformance } from '@/components/providers/performance-provider'

export function usePerformanceTracking(componentName: string) {
  const { recordMetric } = usePerformance()
  
  const trackRender = useCallback(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      recordMetric(`${componentName}_render_time`, endTime - startTime)
    }
  }, [componentName, recordMetric])

  const trackInteraction = useCallback((interactionType: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      recordMetric(`${componentName}_${interactionType}_time`, endTime - startTime)
    }
  }, [componentName, recordMetric])

  const trackError = useCallback((error: Error) => {
    recordMetric(`${componentName}_error`, 1, {
      message: error.message,
      stack: error.stack
    })
  }, [componentName, recordMetric])

  return {
    trackRender,
    trackInteraction,
    trackError
  }
}

// Usage in component
export function TrackedProductCard({ product }) {
  const { trackRender, trackInteraction } = usePerformanceTracking('ProductCard')
  
  useEffect(() => {
    const stopTracking = trackRender()
    return stopTracking
  }, [trackRender])

  const handleAddToCart = () => {
    const stopTracking = trackInteraction('add_to_cart')
    
    // Add to cart logic
    addToCart(product)
    
    stopTracking()
  }

  return (
    <div className="product-card">
      {/* Product card content */}
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}
```

### 2. Real-Time Performance Alerts

```tsx
// components/monitoring/PerformanceAlerts.tsx
import { usePerformance } from '@/components/providers/performance-provider'
import { useToast } from '@/hooks/useToast'

export function PerformanceAlerts() {
  const { performanceScore, violations } = usePerformance()
  const { showToast } = useToast()

  useEffect(() => {
    if (performanceScore < 50) {
      showToast({
        type: 'warning',
        title: 'Performance Issue',
        message: 'Page performance is below optimal. Some features may be slower.',
        duration: 5000
      })
    }
  }, [performanceScore, showToast])

  useEffect(() => {
    violations.forEach(violation => {
      if (violation.severity === 'critical') {
        showToast({
          type: 'error',
          title: 'Critical Performance Issue',
          message: `${violation.metric} exceeded budget by ${violation.percentage}%`,
          duration: 8000
        })
      }
    })
  }, [violations, showToast])

  return null // This component only handles alerts
}
```

## Testing Examples

### 1. Performance Testing

```tsx
// __tests__/performance/lazy-loading.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { SmartLazyLoader } from '@/components/lazy/smart-lazy-loader'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('SmartLazyLoader Performance', () => {
  it('should not load content until in viewport', async () => {
    const TestComponent = () => <div data-testid="lazy-content">Loaded!</div>
    
    render(
      <SmartLazyLoader fallback={<div data-testid="fallback">Loading...</div>}>
        <TestComponent />
      </SmartLazyLoader>
    )

    // Should show fallback initially
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('lazy-content')).not.toBeInTheDocument()

    // Simulate intersection
    const [observerCallback] = mockIntersectionObserver.mock.calls[0]
    observerCallback([{ isIntersecting: true }])

    // Should load content
    await waitFor(() => {
      expect(screen.getByTestId('lazy-content')).toBeInTheDocument()
    })
  })

  it('should adapt batch size based on network conditions', () => {
    // Test network-aware batch sizing
    const mockConnection = {
      effectiveType: 'slow-2g',
      downlink: 0.5,
      rtt: 2000
    }
    
    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      writable: true
    })

    const { result } = renderHook(() => useNetworkAwareOptimization())
    
    expect(result.current.batchSize).toBeLessThanOrEqual(6)
    expect(result.current.imageQuality).toBe('low')
  })
})
```

### 2. Error Boundary Testing

```tsx
// __tests__/error-handling/error-boundary.test.tsx
import { render, screen } from '@testing-library/react'
import { EnhancedErrorBoundary } from '@/components/ui/error-boundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('EnhancedErrorBoundary', () => {
  it('should catch and display errors', () => {
    const onError = jest.fn()
    
    render(
      <EnhancedErrorBoundary onError={onError} fallback="Something went wrong">
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    )
  })

  it('should provide retry functionality', async () => {
    const onError = jest.fn()
    let shouldThrow = true
    
    const RetryableComponent = () => <ThrowError shouldThrow={shouldThrow} />
    
    render(
      <EnhancedErrorBoundary onError={onError}>
        <RetryableComponent />
      </EnhancedErrorBoundary>
    )

    // Should show error initially
    expect(screen.getByText(/retry/i)).toBeInTheDocument()

    // Fix the error and retry
    shouldThrow = false
    fireEvent.click(screen.getByText(/retry/i))

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })
})
```

## Best Practices Summary

### 1. Performance Optimization
- Always use network-aware loading strategies
- Implement progressive enhancement
- Monitor Core Web Vitals continuously
- Use adaptive skeletons for better perceived performance
- Batch API requests based on network conditions

### 2. Error Handling
- Wrap critical components with error boundaries
- Implement automatic recovery strategies
- Provide meaningful error messages to users
- Log errors with sufficient context for debugging
- Test error scenarios thoroughly

### 3. Mobile Optimization
- Use minimum 44px touch targets
- Implement pull-to-refresh where appropriate
- Optimize for slow networks and limited memory
- Use haptic feedback for better UX
- Test on real devices with throttled connections

### 4. Monitoring & Analytics
- Track custom performance metrics
- Set up meaningful alerts
- Monitor user interactions and errors
- Use real user monitoring (RUM)
- Regularly review and adjust performance budgets

### 5. Development Workflow
- Test performance optimizations locally
- Use performance budgets in CI/CD
- Monitor performance regressions
- Document performance decisions
- Share performance insights with the team

This comprehensive guide provides practical examples for implementing and using the NubiaGo UX Optimization System effectively across different scenarios and use cases.
