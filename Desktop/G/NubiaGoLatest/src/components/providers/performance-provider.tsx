/**
 * Performance Provider
 * Global performance monitoring and optimization context
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useLoadingStore } from '@/lib/services/unified-loading.service'
import { errorLogger } from '@/lib/services/error-logging.service'
import { performanceMetrics } from '@/lib/performance'

interface PerformanceContextType {
  isOptimizationEnabled: boolean
  performanceScore: number
  networkInfo: NetworkInfo | null
  optimizationStrategy: OptimizationStrategy
  toggleOptimization: () => void
  reportPerformanceIssue: (issue: PerformanceIssue) => void
}

interface NetworkInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
}

interface OptimizationStrategy {
  imageQuality: number
  enableLazyLoading: boolean
  enableCodeSplitting: boolean
  batchSize: number
  prefetchDistance: number
  cacheStrategy: 'aggressive' | 'normal' | 'minimal'
}

interface PerformanceIssue {
  type: 'slow_render' | 'memory_leak' | 'network_slow' | 'bundle_large'
  component: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metrics: Record<string, number>
  timestamp: number
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

interface PerformanceProviderProps {
  children: ReactNode
  enableAutoOptimization?: boolean
  performanceBudget?: {
    renderTime: number
    bundleSize: number
    memoryUsage: number
  }
}

export function PerformanceProvider({ 
  children, 
  enableAutoOptimization = true,
  performanceBudget = {
    renderTime: 16,
    bundleSize: 250,
    memoryUsage: 50
  }
}: PerformanceProviderProps) {
  const [isOptimizationEnabled, setIsOptimizationEnabled] = useState(enableAutoOptimization)
  const [performanceScore, setPerformanceScore] = useState(100)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [optimizationStrategy, setOptimizationStrategy] = useState<OptimizationStrategy>({
    imageQuality: 75,
    enableLazyLoading: true,
    enableCodeSplitting: true,
    batchSize: 10,
    prefetchDistance: 200,
    cacheStrategy: 'normal'
  })

  // Network monitoring
  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        const info: NetworkInfo = {
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        }
        
        setNetworkInfo(info)
        updateOptimizationStrategy(info)
      }
    }

    updateNetworkInfo()
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateNetworkInfo)
      return () => connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [])

  // Update optimization strategy based on network conditions
  const updateOptimizationStrategy = (network: NetworkInfo) => {
    let strategy: OptimizationStrategy = {
      imageQuality: 75,
      enableLazyLoading: true,
      enableCodeSplitting: true,
      batchSize: 10,
      prefetchDistance: 200,
      cacheStrategy: 'normal'
    }

    if (network.saveData || network.effectiveType === 'slow-2g') {
      strategy = {
        imageQuality: 40,
        enableLazyLoading: true,
        enableCodeSplitting: true,
        batchSize: 3,
        prefetchDistance: 50,
        cacheStrategy: 'aggressive'
      }
    } else if (network.effectiveType === '2g') {
      strategy = {
        imageQuality: 50,
        enableLazyLoading: true,
        enableCodeSplitting: true,
        batchSize: 5,
        prefetchDistance: 100,
        cacheStrategy: 'aggressive'
      }
    } else if (network.effectiveType === '3g') {
      strategy = {
        imageQuality: 65,
        enableLazyLoading: true,
        enableCodeSplitting: true,
        batchSize: 8,
        prefetchDistance: 150,
        cacheStrategy: 'normal'
      }
    } else if (network.effectiveType === '4g' && network.downlink > 10) {
      strategy = {
        imageQuality: 85,
        enableLazyLoading: false,
        enableCodeSplitting: false,
        batchSize: 15,
        prefetchDistance: 300,
        cacheStrategy: 'minimal'
      }
    }

    setOptimizationStrategy(strategy)
  }

  // Performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      let score = 100
      const issues: PerformanceIssue[] = []

      // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024
        
        if (memoryUsage > performanceBudget.memoryUsage) {
          score -= 25
          issues.push({
            type: 'memory_leak',
            component: 'global',
            severity: memoryUsage > performanceBudget.memoryUsage * 2 ? 'critical' : 'high',
            metrics: { memoryUsage },
            timestamp: Date.now()
          })
        }
      }

      // Check loading states
      const { globalLoading, criticalLoading } = useLoadingStore.getState()
      if (criticalLoading) {
        score -= 15
      }

      // Check network latency
      if (networkInfo && networkInfo.rtt > 500) {
        score -= 20
        issues.push({
          type: 'network_slow',
          component: 'global',
          severity: networkInfo.rtt > 1000 ? 'high' : 'medium',
          metrics: { rtt: networkInfo.rtt, downlink: networkInfo.downlink },
          timestamp: Date.now()
        })
      }

      setPerformanceScore(Math.max(0, score))

      // Report critical issues
      issues.forEach(issue => {
        if (issue.severity === 'critical' || issue.severity === 'high') {
          reportPerformanceIssue(issue)
        }
      })
    }

    const interval = setInterval(monitorPerformance, 5000)
    return () => clearInterval(interval)
  }, [networkInfo, performanceBudget])

  const toggleOptimization = () => {
    setIsOptimizationEnabled(prev => !prev)
  }

  const reportPerformanceIssue = (issue: PerformanceIssue) => {
    errorLogger.logWarning(`Performance issue detected: ${issue.type}`, {
      category: 'ui',
      context: {
        action: 'performance_issue',
        metadata: {
          type: issue.type,
          component: issue.component,
          severity: issue.severity,
          metrics: issue.metrics,
          networkInfo
        }
      },
      tags: ['performance', issue.type, issue.severity]
    })
  }

  const contextValue: PerformanceContextType = {
    isOptimizationEnabled,
    performanceScore,
    networkInfo,
    optimizationStrategy,
    toggleOptimization,
    reportPerformanceIssue
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceDebugPanel />
      )}
    </PerformanceContext.Provider>
  )
}

// Performance debug panel for development
function PerformanceDebugPanel() {
  const context = useContext(PerformanceContext)
  const [isVisible, setIsVisible] = useState(false)

  if (!context) return null

  const { performanceScore, networkInfo, optimizationStrategy, isOptimizationEnabled } = context

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 text-xs"
        title="Performance Debug Panel"
      >
        ⚡ {performanceScore}
      </button>
      
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
          <div className="text-sm space-y-2">
            <div className="font-semibold">Performance Debug</div>
            
            <div>
              <span className="font-medium">Score:</span> {performanceScore}/100
            </div>
            
            <div>
              <span className="font-medium">Optimization:</span>{' '}
              <span className={isOptimizationEnabled ? 'text-green-600' : 'text-red-600'}>
                {isOptimizationEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {networkInfo && (
              <div>
                <div className="font-medium">Network:</div>
                <div className="text-xs text-gray-600">
                  Type: {networkInfo.effectiveType}<br/>
                  Speed: {networkInfo.downlink}Mbps<br/>
                  RTT: {networkInfo.rtt}ms<br/>
                  Save Data: {networkInfo.saveData ? 'Yes' : 'No'}
                </div>
              </div>
            )}
            
            <div>
              <div className="font-medium">Strategy:</div>
              <div className="text-xs text-gray-600">
                Image Quality: {optimizationStrategy.imageQuality}%<br/>
                Lazy Loading: {optimizationStrategy.enableLazyLoading ? 'On' : 'Off'}<br/>
                Batch Size: {optimizationStrategy.batchSize}<br/>
                Cache: {optimizationStrategy.cacheStrategy}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// HOC for performance-aware components
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    priority?: 'critical' | 'high' | 'normal' | 'low'
    enableLazyLoading?: boolean
  }
) {
  return function PerformanceOptimizedComponent(props: P) {
    const { isOptimizationEnabled, optimizationStrategy } = usePerformance()
    
    // Apply optimizations based on strategy
    const shouldLazyLoad = options?.enableLazyLoading ?? optimizationStrategy.enableLazyLoading
    const priority = options?.priority ?? 'normal'

    if (!isOptimizationEnabled) {
      return <Component {...props} />
    }

    // Wrap with performance monitoring
    return (
      <div data-performance-priority={priority}>
        <Component {...props} />
      </div>
    )
  }
}
