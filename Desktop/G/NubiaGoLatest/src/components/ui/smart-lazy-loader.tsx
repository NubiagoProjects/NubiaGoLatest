/**
 * Smart Lazy Loader Component
 * Intelligent lazy loading with performance optimization and adaptive strategies
 */

'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useIntersectionObserver } from '@/lib/performance'
import { useLoading } from '@/lib/services/unified-loading.service'
import { errorLogger } from '@/lib/services/error-logging.service'

interface SmartLazyLoaderProps {
  id: string
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  priority?: 'critical' | 'high' | 'normal' | 'low'
  preloadDistance?: number
  enableIntersectionObserver?: boolean
  enableNetworkAware?: boolean
  retryAttempts?: number
  timeout?: number
  onLoad?: () => void
  onError?: (error: Error) => void
  className?: string
}

interface NetworkInfo {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

export function SmartLazyLoader({
  id,
  children,
  fallback,
  errorFallback,
  threshold = 0.1,
  rootMargin = '50px',
  priority = 'normal',
  preloadDistance = 200,
  enableIntersectionObserver = true,
  enableNetworkAware = true,
  retryAttempts = 3,
  timeout = 10000,
  onLoad,
  onError,
  className = ''
}: SmartLazyLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(!enableIntersectionObserver)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const { isLoading, startLoading, stopLoading, updateProgress } = useLoading(id)
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin: enableNetworkAware ? getAdaptiveRootMargin(networkInfo) : rootMargin
  })

  // Network-aware loading strategy
  const loadingStrategy = useMemo(() => {
    if (!enableNetworkAware || !networkInfo) {
      return { shouldOptimize: false, batchSize: 1, delay: 0 }
    }

    const { effectiveType, saveData, downlink } = networkInfo
    
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return { shouldOptimize: true, batchSize: 1, delay: 1000 }
    }
    
    if (effectiveType === '3g' || downlink < 1.5) {
      return { shouldOptimize: true, batchSize: 2, delay: 500 }
    }
    
    return { shouldOptimize: false, batchSize: 4, delay: 0 }
  }, [networkInfo, enableNetworkAware])

  // Initialize network monitoring
  useEffect(() => {
    if (!enableNetworkAware) return

    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        })
      }
    }

    updateNetworkInfo()
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateNetworkInfo)
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [enableNetworkAware])

  // Intersection observer logic
  useEffect(() => {
    if (!enableIntersectionObserver) return

    if (isIntersecting || hasIntersected) {
      setShouldLoad(true)
    }
  }, [isIntersecting, hasIntersected, enableIntersectionObserver])

  // Smart preloading based on scroll velocity
  useEffect(() => {
    if (!enableIntersectionObserver || hasLoaded || shouldLoad) return

    let lastScrollY = window.scrollY
    let scrollVelocity = 0
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollVelocity = Math.abs(currentScrollY - lastScrollY)
      lastScrollY = currentScrollY

      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const distanceFromViewport = rect.top - window.innerHeight
        
        // Preload if scrolling fast towards the element
        if (scrollVelocity > 10 && distanceFromViewport < preloadDistance) {
          setShouldLoad(true)
        }
      }
    }

    const throttledScroll = throttle(handleScroll, 100)
    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [elementRef, hasLoaded, shouldLoad, preloadDistance, enableIntersectionObserver])

  // Loading logic with retry and timeout
  const performLoad = useCallback(async () => {
    if (hasLoaded || isLoading) return

    startLoading({
      priority,
      timeout,
      maxRetries: retryAttempts,
      metadata: { networkInfo, loadingStrategy }
    })

    try {
      // Simulate progressive loading with network-aware delays
      if (loadingStrategy.shouldOptimize && loadingStrategy.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, loadingStrategy.delay))
      }

      // Update progress
      updateProgress(50, 'Loading content...')
      
      // Simulate content loading (replace with actual loading logic)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      updateProgress(100, 'Content loaded')
      
      setHasLoaded(true)
      stopLoading()
      onLoad?.()
      
      // Log successful load
      errorLogger.logInfo(`Smart lazy loader completed: ${id}`, {
        category: 'ui',
        context: {
          action: 'lazy_load_success',
          metadata: {
            loaderId: id,
            priority,
            networkInfo,
            retryCount
          }
        },
        tags: ['lazy-loading', 'performance']
      })
      
    } catch (error) {
      const loadError = error instanceof Error ? error : new Error(String(error))
      
      if (retryCount < retryAttempts) {
        setRetryCount(prev => prev + 1)
        
        // Exponential backoff for retries
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        setTimeout(() => performLoad(), retryDelay)
        
        errorLogger.logWarning(`Lazy loader retry ${retryCount + 1}/${retryAttempts}: ${id}`, {
          category: 'ui',
          context: {
            action: 'lazy_load_retry',
            metadata: { loaderId: id, retryCount: retryCount + 1, error: loadError.message }
          },
          tags: ['lazy-loading', 'retry']
        })
      } else {
        stopLoading(loadError)
        onError?.(loadError)
        
        errorLogger.logError(loadError, {
          category: 'ui',
          context: {
            action: 'lazy_load_failed',
            metadata: {
              loaderId: id,
              priority,
              networkInfo,
              finalRetryCount: retryCount
            }
          },
          tags: ['lazy-loading', 'error']
        })
      }
    }
  }, [
    hasLoaded, isLoading, startLoading, priority, timeout, retryAttempts,
    loadingStrategy, updateProgress, stopLoading, onLoad, id, retryCount, onError
  ])

  // Trigger loading when shouldLoad becomes true
  useEffect(() => {
    if (shouldLoad && !hasLoaded && !isLoading) {
      performLoad()
    }
  }, [shouldLoad, hasLoaded, isLoading, performLoad])

  // Render loading state
  if (!hasLoaded) {
    if (isLoading) {
      return (
        <div ref={elementRef} className={`smart-lazy-loader loading ${className}`}>
          {fallback || <DefaultLoadingFallback networkInfo={networkInfo} />}
        </div>
      )
    }
    
    if (retryCount >= retryAttempts) {
      return (
        <div ref={elementRef} className={`smart-lazy-loader error ${className}`}>
          {errorFallback || (
            <DefaultErrorFallback 
              onRetry={() => {
                setRetryCount(0)
                setShouldLoad(true)
              }}
            />
          )}
        </div>
      )
    }
    
    return (
      <div ref={elementRef} className={`smart-lazy-loader placeholder ${className}`}>
        {fallback || <DefaultPlaceholder />}
      </div>
    )
  }

  // Render loaded content
  return (
    <div ref={elementRef} className={`smart-lazy-loader loaded ${className}`}>
      {children}
    </div>
  )
}

// Helper function for adaptive root margin
function getAdaptiveRootMargin(networkInfo: NetworkInfo | null): string {
  if (!networkInfo) return '50px'
  
  const { effectiveType, saveData } = networkInfo
  
  if (saveData || effectiveType === 'slow-2g') return '20px'
  if (effectiveType === '2g') return '30px'
  if (effectiveType === '3g') return '50px'
  
  return '100px' // 4g and above
}

// Throttle utility
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

// Default fallback components
function DefaultLoadingFallback({ networkInfo }: { networkInfo: NetworkInfo | null }) {
  const isSlowNetwork = networkInfo?.effectiveType === 'slow-2g' || networkInfo?.effectiveType === '2g'
  
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">
          {isSlowNetwork ? 'Loading (optimizing for slow connection)...' : 'Loading...'}
        </p>
      </div>
    </div>
  )
}

function DefaultErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <p className="text-sm text-red-700 mb-3">Failed to load content</p>
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function DefaultPlaceholder() {
  return (
    <div className="bg-gray-100 rounded-lg p-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

// Batch lazy loader for multiple items
interface BatchLazyLoaderProps {
  items: Array<{
    id: string
    content: React.ReactNode
    priority?: 'critical' | 'high' | 'normal' | 'low'
  }>
  batchSize?: number
  staggerDelay?: number
  className?: string
}

export function BatchLazyLoader({
  items,
  batchSize = 3,
  staggerDelay = 100,
  className = ''
}: BatchLazyLoaderProps) {
  const [loadedBatches, setLoadedBatches] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const loadNextBatch = useCallback(async () => {
    if (isLoading || loadedBatches * batchSize >= items.length) return

    setIsLoading(true)
    
    const startIndex = loadedBatches * batchSize
    const endIndex = Math.min(startIndex + batchSize, items.length)
    
    // Stagger the loading of items in the batch
    for (let i = startIndex; i < endIndex; i++) {
      if (i > startIndex) {
        await new Promise(resolve => setTimeout(resolve, staggerDelay))
      }
    }
    
    setLoadedBatches(prev => prev + 1)
    setIsLoading(false)
  }, [loadedBatches, batchSize, items.length, isLoading, staggerDelay])

  const visibleItems = items.slice(0, loadedBatches * batchSize)
  const hasMore = loadedBatches * batchSize < items.length

  return (
    <div className={`batch-lazy-loader ${className}`}>
      {visibleItems.map(item => (
        <SmartLazyLoader
          key={item.id}
          id={item.id}
          priority={item.priority}
          enableIntersectionObserver={false}
        >
          {item.content}
        </SmartLazyLoader>
      ))}
      
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadNextBatch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : `Load More (${items.length - visibleItems.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}
