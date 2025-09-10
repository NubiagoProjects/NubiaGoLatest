/**
 * Performance utilities for the application
 * Includes code splitting, lazy loading, and performance monitoring
 */

import { ComponentType, Suspense, lazy, useEffect, useRef, useState } from 'react'

/**
 * Lazy import with error boundary and retry logic
 */
export function lazyImport<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3,
  delay: number = 1000
) {
  return lazy(async () => {
    let lastError: Error | null = null
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFunc()
      } catch (error) {
        lastError = error as Error
        console.warn(`Lazy import attempt ${i + 1} failed:`, error)
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }
    
    throw lastError || new Error('Lazy import failed after all retries')
  })
}

/**
 * Lazy load components with specific chunk names for better caching
 */
export const lazyComponents = {
  // Example: FileUpload: lazyImport(() => import('@/components/ui/file-upload')),
  // ... (only existing components should be here)
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      const isIntersecting = entry.isIntersecting
      setIsIntersecting(isIntersecting)
      
      if (isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      rootMargin: '50px', // Start loading 50px before element comes into view
      threshold: 0.1,
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options, hasIntersected])

  return { elementRef, isIntersecting, hasIntersected }
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const [renderTime, setRenderTime] = useState<number>(0)
  const [mountTime, setMountTime] = useState<number>(0)
  const startTime = useRef<number>(performance.now())

  useEffect(() => {
    const mountEndTime = performance.now()
    const mountDuration = mountEndTime - startTime.current
    setMountTime(mountDuration)

    // Log performance metrics
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} mounted in ${mountDuration.toFixed(2)}ms`)
    }

    // Report to performance monitoring service
    if (mountDuration > 100) { // Log slow components
      console.warn(`[Performance] Slow component: ${componentName} took ${mountDuration.toFixed(2)}ms to mount`)
    }
  }, [componentName])

  const measureRender = () => {
    const renderEndTime = performance.now()
    const renderDuration = renderEndTime - startTime.current
    setRenderTime(renderDuration)
    startTime.current = renderEndTime
  }

  return { renderTime, mountTime, measureRender }
}

/**
 * Debounce hook for search inputs
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Lazy image loading hook
 */
export function useLazyImage(src: string, fallback?: string) {
  const [imageSrc, setImageSrc] = useState<string>(fallback || '')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    setIsLoading(true)
    setHasError(false)

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
    }
    img.onerror = () => {
      if (fallback) {
        setImageSrc(fallback)
      }
      setIsLoading(false)
      setHasError(true)
    }
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, fallback])

  return { imageSrc, isLoading, hasError }
}

/**
 * Bundle size analyzer
 */
export function useBundleAnalyzer() {
  const [bundleSize, setBundleSize] = useState<{
    total: number
    chunks: Record<string, number>
  } | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // In development, we can't get actual bundle sizes
      // This would be implemented in production with webpack bundle analyzer
      return
    }

    // This would be implemented with actual bundle analysis
    // For now, we'll just set a placeholder
    setBundleSize({
      total: 0,
      chunks: {}
    })
  }, [])

  return bundleSize
}

/**
 * Memory usage monitor
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const updateMemoryInfo = () => {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }

      updateMemoryInfo()
      const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [])

  return memoryInfo
}

/**
 * Network performance monitor
 */
export function useNetworkMonitor() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string
    downlink: number
    rtt: number
  } | null>(null)

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0
        })
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)

      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}

/**
 * Performance budget checker
 */
export function usePerformanceBudget(
  budget: {
    mountTime: number
    renderTime: number
    bundleSize: number
  }
) {
  const [violations, setViolations] = useState<string[]>([])

  const checkBudget = (metrics: {
    mountTime?: number
    renderTime?: number
    bundleSize?: number
  }) => {
    const newViolations: string[] = []

    if (metrics.mountTime && metrics.mountTime > budget.mountTime) {
      newViolations.push(`Mount time ${metrics.mountTime}ms exceeds budget of ${budget.mountTime}ms`)
    }

    if (metrics.renderTime && metrics.renderTime > budget.renderTime) {
      newViolations.push(`Render time ${metrics.renderTime}ms exceeds budget of ${budget.renderTime}ms`)
    }

    if (metrics.bundleSize && metrics.bundleSize > budget.bundleSize) {
      newViolations.push(`Bundle size ${metrics.bundleSize}KB exceeds budget of ${budget.bundleSize}KB`)
    }

    setViolations(newViolations)
    return newViolations
  }

  return { violations, checkBudget }
}

/**
 * Lazy loading wrapper with loading state
 * Note: This function returns JSX and should be used in .tsx files
 */
export function LazyWrapper<T extends ComponentType<any>>(
  Component: T,
  fallback?: React.ReactNode
) {
  return {
    Component,
    fallback: fallback || 'Loading...'
  }
}

/**
 * Preload component for better performance
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return () => {
    const promise = importFunc()
    promise.then(() => {
      // Component is now loaded and cached
      console.log('Component preloaded successfully')
    })
    return promise
  }
}

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private static instance: PerformanceMetrics
  private metrics: Map<string, number[]> = new Map()
  private observers: Set<PerformanceObserver> = new Set()

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics()
    }
    return PerformanceMetrics.instance
  }

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string): string {
    const markName = `${name}_start_${Date.now()}`
    performance.mark(markName)
    return markName
  }

  /**
   * End measuring a performance metric
   */
  endMeasure(name: string, startMark: string): number {
    const endMark = `${name}_end_${Date.now()}`
    performance.mark(endMark)
    
    const measureName = `${name}_measure_${Date.now()}`
    performance.measure(measureName, startMark, endMark)
    
    const entries = performance.getEntriesByName(measureName)
    const duration = entries[entries.length - 1]?.duration || 0
    
    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)
    
    // Clean up marks and measures
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    performance.clearMeasures(measureName)
    
    return duration
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const durations = this.metrics.get(name)
    if (!durations || durations.length === 0) return 0
    
    const sum = durations.reduce((acc, duration) => acc + duration, 0)
    return sum / durations.length
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {}
    
    for (const [name, durations] of this.metrics) {
      if (durations.length === 0) continue
      
      const sum = durations.reduce((acc, duration) => acc + duration, 0)
      const average = sum / durations.length
      const min = Math.min(...durations)
      const max = Math.max(...durations)
      
      result[name] = { average, count: durations.length, min, max }
    }
    
    return result
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * Setup performance observer for automatic metric collection
   */
  setupObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return

    // Observe navigation timing
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordNavigationMetrics(navEntry)
          }
        }
      })
      
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.add(navigationObserver)
    } catch (error) {
      console.warn('Failed to setup navigation observer:', error)
    }

    // Observe resource timing
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordResourceMetrics(resourceEntry)
          }
        }
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.add(resourceObserver)
    } catch (error) {
      console.warn('Failed to setup resource observer:', error)
    }
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'navigation.domContentLoaded': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      'navigation.load': entry.loadEventEnd - entry.loadEventStart,
      'navigation.domInteractive': entry.domInteractive - entry.fetchStart,
      'navigation.firstPaint': entry.responseStart - entry.fetchStart
    }

    for (const [name, duration] of Object.entries(metrics)) {
      if (!this.metrics.has(name)) {
        this.metrics.set(name, [])
      }
      this.metrics.get(name)!.push(duration)
    }
  }

  /**
   * Record resource timing metrics
   */
  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.fetchStart
    
    if (!this.metrics.has('resource.duration')) {
      this.metrics.set('resource.duration', [])
    }
    this.metrics.get('resource.duration')!.push(duration)
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    for (const observer of this.observers) {
      observer.disconnect()
    }
    this.observers.clear()
  }
}

// Export singleton instance
export const performanceMetrics = PerformanceMetrics.getInstance()

// Auto-setup observer
if (typeof window !== 'undefined') {
  performanceMetrics.setupObserver()
} 
