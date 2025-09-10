import { db } from '@/lib/firebase/config'
import { Product } from '@/types'

// ============================================================================
// PERFORMANCE MONITORING SERVICE
// ============================================================================

// Type declarations for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
  startTime: number
}

interface PerformanceNavigationTiming extends PerformanceEntry {
  loadEventEnd: number
  loadEventStart: number
  domContentLoadedEventEnd: number
  domContentLoadedEventStart: number
  fetchStart: number
}

export interface PerformanceMetrics {
  // Navigation timing
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  totalLoadTime: number
  
  // Resource timing
  resourceCount: number
  resourceLoadTime: number
  
  // User interactions
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  
  // Custom metrics
  componentRenderTime: number
  apiResponseTime: number
  bundleSize: number
}

export interface PerformanceEvent {
  name: string
  value: number
  category: 'navigation' | 'resource' | 'interaction' | 'custom' | 'performance'
  timestamp: number
  metadata?: Record<string, any>
}

export class PerformanceService {
  private events: PerformanceEvent[] = []
  private observers: Map<string, PerformanceObserver> = new Map()
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.initialize()
    } else if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Lightweight production monitoring
      this.initializeProductionMonitoring()
    }
  }

  private initialize() {
    if (this.isInitialized) return

    // Monitor navigation timing
    this.observeNavigationTiming()
    
    // Monitor resource timing
    this.observeResourceTiming()
    
    // Monitor user interactions
    this.observeUserInteractions()
    
    // Monitor web vitals
    this.observeWebVitals()

    this.isInitialized = true
  }

  private initializeProductionMonitoring() {
    if (this.isInitialized) return

    // Only monitor critical web vitals in production
    this.observeWebVitals()
    
    // Monitor critical API performance
    this.monitorCriticalAPIs()
    
    this.isInitialized = true
  }

  private monitorCriticalAPIs() {
    // Monitor fetch requests
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const startTime = performance.now()
        try {
          const response = await originalFetch(...args)
          const duration = performance.now() - startTime
          
          // Only log slow requests (>1s) in production
          if (duration > 1000) {
            this.recordEvent('api-slow', {
              name: 'slow_api_request',
              value: duration,
              category: 'performance',
              timestamp: Date.now(),
              metadata: { url: args[0], status: response.status }
            })
          }
          
          return response
        } catch (error) {
          const duration = performance.now() - startTime
          this.recordEvent('api-error', {
            name: 'api_error',
            value: duration,
            category: 'performance',
            timestamp: Date.now(),
            metadata: { url: args[0], error: (error as Error).message }
          })
          throw error
        }
      }
    }
  }

  private observeNavigationTiming() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordEvent('navigation', {
              name: 'page_load',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              category: 'navigation',
              timestamp: Date.now(),
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,
              }
            })
          }
        }
      })

      observer.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', observer)
    } catch (error) {
      console.warn('Failed to observe navigation timing:', error)
    }
  }

  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordEvent('resource', {
              name: 'resource_load',
              value: resourceEntry.duration,
              category: 'resource',
              timestamp: Date.now(),
              metadata: {
                name: resourceEntry.name,
                type: resourceEntry.initiatorType,
                size: resourceEntry.transferSize,
              }
            })
          }
        }
      })

      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', observer)
    } catch (error) {
      console.warn('Failed to observe resource timing:', error)
    }
  }

  private observeUserInteractions() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            const measureEntry = entry as PerformanceMeasure
            this.recordEvent('interaction', {
              name: measureEntry.name,
              value: measureEntry.duration,
              category: 'interaction',
              timestamp: Date.now(),
            })
          }
        }
      })

      observer.observe({ entryTypes: ['measure'] })
      this.observers.set('interaction', observer)
    } catch (error) {
      console.warn('Failed to observe user interactions:', error)
    }
  }

  private observeWebVitals() {
    if (!('PerformanceObserver' in window)) return

    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            this.recordEvent('web-vital', {
              name: 'first_contentful_paint',
              value: entry.startTime,
              category: 'interaction',
              timestamp: Date.now(),
            })
          }
        }
      })

      fcpObserver.observe({ entryTypes: ['paint'] })
      this.observers.set('fcp', fcpObserver)

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.recordEvent('web-vital', {
              name: 'largest_contentful_paint',
              value: entry.startTime,
              category: 'interaction',
              timestamp: Date.now(),
            })
          }
        }
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', lcpObserver)

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming
            this.recordEvent('web-vital', {
              name: 'first_input_delay',
              value: firstInputEntry.processingStart - firstInputEntry.startTime,
              category: 'interaction',
              timestamp: Date.now(),
            })
          }
        }
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', fidObserver)
    } catch (error) {
      console.warn('Failed to observe web vitals:', error)
    }
  }

  private recordEvent(type: string, event: PerformanceEvent) {
    // In production, only keep critical events and limit memory usage
    const maxEvents = process.env.NODE_ENV === 'production' ? 100 : 1000
    
    this.events.push(event)
    
    // Keep only last N events to prevent memory issues
    if (this.events.length > maxEvents) {
      this.events = this.events.slice(-maxEvents)
    }

    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Event [${type}]:`, event)
    }

    // In production, send critical events to monitoring service
    if (process.env.NODE_ENV === 'production' && this.isCriticalEvent(type, event)) {
      this.sendToMonitoring(type, event)
    }
  }

  private isCriticalEvent(type: string, event: PerformanceEvent): boolean {
    // Define what constitutes a critical event in production
    const criticalTypes = ['api-error', 'api-slow', 'web-vital']
    const criticalThresholds = {
      'first_contentful_paint': 2500, // 2.5s
      'largest_contentful_paint': 4000, // 4s
      'first_input_delay': 300, // 300ms
      'slow_api_request': 1000 // 1s
    }

    if (criticalTypes.includes(type)) return true
    if (criticalThresholds[event.name as keyof typeof criticalThresholds] && 
        event.value > criticalThresholds[event.name as keyof typeof criticalThresholds]) {
      return true
    }

    return false
  }

  private sendToMonitoring(type: string, event: PerformanceEvent) {
    // In a real implementation, send to monitoring services like:
    // - Google Analytics 4
    // - Sentry Performance
    // - DataDog RUM
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: event.name,
        metric_value: event.value,
        metric_category: event.category,
        custom_parameter_1: type
      })
    }
  }

  // Public methods
  public recordCustomEvent(name: string, value: number, metadata?: Record<string, any>) {
    this.recordEvent('custom', {
      name,
      value,
      category: 'custom',
      timestamp: Date.now(),
      metadata,
    })
  }

  public recordComponentRenderTime(componentName: string, renderTime: number) {
    this.recordCustomEvent(`component_render_${componentName}`, renderTime)
  }

  public recordApiResponseTime(endpoint: string, responseTime: number) {
    this.recordCustomEvent(`api_response_${endpoint}`, responseTime)
  }

  public getMetrics(): PerformanceMetrics {
    const navigationEvents = this.events.filter(e => e.category === 'navigation')
    const resourceEvents = this.events.filter(e => e.category === 'resource')
    const interactionEvents = this.events.filter(e => e.category === 'interaction')

    return {
      navigationStart: performance.timing?.navigationStart || 0,
      domContentLoaded: navigationEvents.find(e => e.name === 'page_load')?.metadata?.domContentLoaded || 0,
      loadComplete: navigationEvents.find(e => e.name === 'page_load')?.metadata?.loadComplete || 0,
      totalLoadTime: navigationEvents.find(e => e.name === 'page_load')?.metadata?.totalLoadTime || 0,
      resourceCount: resourceEvents.length,
      resourceLoadTime: resourceEvents.reduce((sum, e) => sum + e.value, 0),
      firstContentfulPaint: interactionEvents.find(e => e.name === 'first_contentful_paint')?.value || 0,
      largestContentfulPaint: interactionEvents.find(e => e.name === 'largest_contentful_paint')?.value || 0,
      firstInputDelay: interactionEvents.find(e => e.name === 'first_input_delay')?.value || 0,
      componentRenderTime: this.events.filter(e => e.name.startsWith('component_render_')).reduce((sum, e) => sum + e.value, 0),
      apiResponseTime: this.events.filter(e => e.name.startsWith('api_response_')).reduce((sum, e) => sum + e.value, 0),
      bundleSize: this.calculateBundleSize(),
    }
  }

  private calculateBundleSize(): number {
    if (typeof window === 'undefined') return 0

    let totalSize = 0
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    for (const resource of resources) {
      const size = (resource as PerformanceResourceTiming).transferSize || 0
      totalSize += size
    }

    return totalSize
  }

  public getEvents(category?: string): PerformanceEvent[] {
    if (category) {
      return this.events.filter(e => e.category === category)
    }
    return [...this.events]
  }

  public clearEvents() {
    this.events = []
  }

  public disconnect() {
    for (const [name, observer] of this.observers) {
      observer.disconnect()
    }
    this.observers.clear()
  }

  // Utility methods
  public measureTime(name: string, fn: () => void) {
    const start = performance.now()
    fn()
    const end = performance.now()
    this.recordCustomEvent(name, end - start)
  }

  public async measureAsyncTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      this.recordCustomEvent(name, end - start)
      return result
    } catch (error) {
      const end = performance.now()
      this.recordCustomEvent(`${name}_error`, end - start)
      throw error
    }
  }
}

// Export singleton instance
export const performanceService = new PerformanceService()

// Hook for component performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const startTime = performance.now()

  return {
    recordRender: () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      performanceService.recordComponentRenderTime(componentName, renderTime)
    },
    measureTime: (name: string, fn: () => void) => {
      performanceService.measureTime(`${componentName}_${name}`, fn)
    },
    measureAsyncTime: <T>(name: string, fn: () => Promise<T>) => {
      return performanceService.measureAsyncTime(`${componentName}_${name}`, fn)
    },
  }
} 
