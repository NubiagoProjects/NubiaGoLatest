/**
 * Performance Optimization Hook
 * Centralized performance monitoring and optimization strategies
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLoadingStore } from '@/lib/services/unified-loading.service'
import { errorLogger } from '@/lib/services/error-logging.service'
import { performanceMetrics } from '@/lib/performance'

interface PerformanceMetrics {
  renderTime: number
  mountTime: number
  memoryUsage: number
  networkLatency: number
  bundleSize: number
  errorRate: number
}

interface OptimizationConfig {
  enableLazyLoading: boolean
  enableImageOptimization: boolean
  enableCodeSplitting: boolean
  enableCaching: boolean
  performanceBudget: {
    renderTime: number
    bundleSize: number
    memoryUsage: number
  }
}

export function usePerformanceOptimization(componentName: string, config?: Partial<OptimizationConfig>) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    bundleSize: 0,
    errorRate: 0
  })
  
  const [optimizations, setOptimizations] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  
  const startTime = useRef(performance.now())
  const renderCount = useRef(0)
  const errorCount = useRef(0)
  const totalRenders = useRef(0)

  const defaultConfig: OptimizationConfig = {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enableCaching: true,
    performanceBudget: {
      renderTime: 16, // 60fps
      bundleSize: 250, // 250KB
      memoryUsage: 50 // 50MB
    }
  }

  const finalConfig = { ...defaultConfig, ...config }

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    renderCount.current++
    totalRenders.current++

    // Memory usage (if available)
    let memoryUsage = 0
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }

    // Network latency estimation
    const networkLatency = getNetworkLatency()

    setMetrics(prev => ({
      ...prev,
      renderTime,
      memoryUsage,
      networkLatency,
      errorRate: errorCount.current / totalRenders.current
    }))

    // Check performance budget
    checkPerformanceBudget(renderTime, memoryUsage)

    startTime.current = performance.now()
  }, [finalConfig.performanceBudget])

  // Check performance budget violations
  const checkPerformanceBudget = useCallback((renderTime: number, memoryUsage: number) => {
    const newWarnings: string[] = []

    if (renderTime > finalConfig.performanceBudget.renderTime) {
      newWarnings.push(`Render time ${renderTime.toFixed(2)}ms exceeds budget of ${finalConfig.performanceBudget.renderTime}ms`)
    }

    if (memoryUsage > finalConfig.performanceBudget.memoryUsage) {
      newWarnings.push(`Memory usage ${memoryUsage.toFixed(2)}MB exceeds budget of ${finalConfig.performanceBudget.memoryUsage}MB`)
    }

    if (newWarnings.length > 0) {
      setWarnings(newWarnings)
      
      errorLogger.logWarning(`Performance budget violations in ${componentName}`, {
        category: 'ui',
        context: {
          action: 'performance_budget_violation',
          metadata: {
            component: componentName,
            renderTime,
            memoryUsage,
            violations: newWarnings
          }
        },
        tags: ['performance', 'budget-violation']
      })
    } else {
      setWarnings([])
    }
  }, [componentName, finalConfig.performanceBudget])

  // Get network latency estimation
  const getNetworkLatency = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection.rtt || 0
    }
    return 0
  }, [])

  // Suggest optimizations based on metrics
  const suggestOptimizations = useCallback(() => {
    const suggestions: string[] = []

    if (metrics.renderTime > 50) {
      suggestions.push('Consider using React.memo or useMemo for expensive calculations')
    }

    if (metrics.memoryUsage > 30) {
      suggestions.push('Consider implementing virtual scrolling for large lists')
    }

    if (metrics.networkLatency > 200) {
      suggestions.push('Enable aggressive caching and image optimization')
    }

    if (renderCount.current > 10) {
      suggestions.push('Component is re-rendering frequently - check dependencies')
    }

    setOptimizations(suggestions)
  }, [metrics])

  // Record error
  const recordError = useCallback((error: Error) => {
    errorCount.current++
    
    errorLogger.logUIError(error, {
      component: componentName,
      action: 'performance_error',
      metadata: {
        renderCount: renderCount.current,
        metrics
      }
    })
  }, [componentName, metrics])

  // Mount time measurement
  useEffect(() => {
    const mountEndTime = performance.now()
    const mountTime = mountEndTime - startTime.current

    setMetrics(prev => ({ ...prev, mountTime }))

    if (mountTime > 100) {
      errorLogger.logWarning(`Slow component mount: ${componentName}`, {
        category: 'ui',
        context: {
          action: 'slow_mount',
          metadata: { component: componentName, mountTime }
        },
        tags: ['performance', 'mount']
      })
    }
  }, [componentName])

  // Performance monitoring interval
  useEffect(() => {
    const interval = setInterval(() => {
      measurePerformance()
      suggestOptimizations()
    }, 1000)

    return () => clearInterval(interval)
  }, [measurePerformance, suggestOptimizations])

  // Bundle size estimation
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const entries = performance.getEntriesByType('navigation')
      if (entries.length > 0) {
        const navEntry = entries[0] as PerformanceNavigationTiming
        const transferSize = navEntry.transferSize || 0
        setMetrics(prev => ({ ...prev, bundleSize: transferSize / 1024 })) // KB
      }
    }
  }, [])

  return {
    metrics,
    optimizations,
    warnings,
    recordError,
    measurePerformance,
    config: finalConfig
  }
}

// Performance monitoring HOC
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const name = componentName || Component.displayName || Component.name || 'Unknown'
    const { measurePerformance, recordError } = usePerformanceOptimization(name)

    useEffect(() => {
      measurePerformance()
    })

    // Error boundary integration
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        recordError(new Error(event.message))
      }

      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }, [recordError])

    return <Component {...props} />
  }
}

// Performance budget checker
export function usePerformanceBudget(budget: {
  renderTime?: number
  memoryUsage?: number
  bundleSize?: number
  networkLatency?: number
}) {
  const [violations, setViolations] = useState<string[]>([])
  const [score, setScore] = useState(100)

  const checkBudget = useCallback((metrics: Partial<PerformanceMetrics>) => {
    const newViolations: string[] = []
    let currentScore = 100

    if (budget.renderTime && metrics.renderTime && metrics.renderTime > budget.renderTime) {
      newViolations.push(`Render time: ${metrics.renderTime.toFixed(2)}ms > ${budget.renderTime}ms`)
      currentScore -= 20
    }

    if (budget.memoryUsage && metrics.memoryUsage && metrics.memoryUsage > budget.memoryUsage) {
      newViolations.push(`Memory usage: ${metrics.memoryUsage.toFixed(2)}MB > ${budget.memoryUsage}MB`)
      currentScore -= 25
    }

    if (budget.bundleSize && metrics.bundleSize && metrics.bundleSize > budget.bundleSize) {
      newViolations.push(`Bundle size: ${metrics.bundleSize.toFixed(2)}KB > ${budget.bundleSize}KB`)
      currentScore -= 30
    }

    if (budget.networkLatency && metrics.networkLatency && metrics.networkLatency > budget.networkLatency) {
      newViolations.push(`Network latency: ${metrics.networkLatency}ms > ${budget.networkLatency}ms`)
      currentScore -= 15
    }

    setViolations(newViolations)
    setScore(Math.max(0, currentScore))

    return { violations: newViolations, score: currentScore }
  }, [budget])

  return { violations, score, checkBudget }
}

// Network-aware optimization hook
export function useNetworkOptimization() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string
    downlink: number
    rtt: number
    saveData: boolean
  } | null>(null)

  const [optimizationStrategy, setOptimizationStrategy] = useState<{
    imageQuality: number
    enableLazyLoading: boolean
    batchSize: number
    prefetchDistance: number
  }>({
    imageQuality: 75,
    enableLazyLoading: true,
    batchSize: 10,
    prefetchDistance: 200
  })

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateNetworkInfo = () => {
        const info = {
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        }
        
        setNetworkInfo(info)
        
        // Adjust optimization strategy based on network
        let strategy = {
          imageQuality: 75,
          enableLazyLoading: true,
          batchSize: 10,
          prefetchDistance: 200
        }

        if (info.saveData || info.effectiveType === 'slow-2g') {
          strategy = {
            imageQuality: 40,
            enableLazyLoading: true,
            batchSize: 3,
            prefetchDistance: 50
          }
        } else if (info.effectiveType === '2g') {
          strategy = {
            imageQuality: 50,
            enableLazyLoading: true,
            batchSize: 5,
            prefetchDistance: 100
          }
        } else if (info.effectiveType === '3g') {
          strategy = {
            imageQuality: 65,
            enableLazyLoading: true,
            batchSize: 8,
            prefetchDistance: 150
          }
        }

        setOptimizationStrategy(strategy)
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)
      
      return () => connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [])

  return { networkInfo, optimizationStrategy }
}
