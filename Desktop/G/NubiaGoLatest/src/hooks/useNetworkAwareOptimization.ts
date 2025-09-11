/**
 * Network-Aware Optimization Hook
 * Dynamically adjusts performance strategies based on network conditions
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePerformance } from '@/components/providers/performance-provider'
import { performanceBudgetManager } from '@/lib/utils/performance-budget'
import { errorLogger } from '@/lib/services/error-logging.service'

interface NetworkOptimizationConfig {
  imageQuality: number
  lazyLoadingDistance: number
  batchSize: number
  prefetchEnabled: boolean
  animationsEnabled: boolean
  cacheStrategy: 'aggressive' | 'normal' | 'minimal'
  compressionLevel: number
  retryAttempts: number
  timeoutDuration: number
}

interface NetworkMetrics {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
  isOnline: boolean
  bandwidth: 'high' | 'medium' | 'low' | 'very-low'
}

const DEFAULT_CONFIGS: Record<string, NetworkOptimizationConfig> = {
  'slow-2g': {
    imageQuality: 30,
    lazyLoadingDistance: 50,
    batchSize: 2,
    prefetchEnabled: false,
    animationsEnabled: false,
    cacheStrategy: 'aggressive',
    compressionLevel: 9,
    retryAttempts: 5,
    timeoutDuration: 15000
  },
  '2g': {
    imageQuality: 45,
    lazyLoadingDistance: 100,
    batchSize: 3,
    prefetchEnabled: false,
    animationsEnabled: false,
    cacheStrategy: 'aggressive',
    compressionLevel: 7,
    retryAttempts: 4,
    timeoutDuration: 12000
  },
  '3g': {
    imageQuality: 65,
    lazyLoadingDistance: 150,
    batchSize: 6,
    prefetchEnabled: true,
    animationsEnabled: true,
    cacheStrategy: 'normal',
    compressionLevel: 5,
    retryAttempts: 3,
    timeoutDuration: 8000
  },
  '4g': {
    imageQuality: 85,
    lazyLoadingDistance: 300,
    batchSize: 12,
    prefetchEnabled: true,
    animationsEnabled: true,
    cacheStrategy: 'minimal',
    compressionLevel: 3,
    retryAttempts: 2,
    timeoutDuration: 5000
  }
}

export function useNetworkAwareOptimization() {
  const { networkInfo, optimizationStrategy } = usePerformance()
  const [config, setConfig] = useState<NetworkOptimizationConfig>(DEFAULT_CONFIGS['4g'])
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null)
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    shouldReduceQuality: false,
    shouldDisableAnimations: false,
    shouldIncreaseBatching: false,
    shouldEnableCompression: false
  })

  // Monitor network changes and adapt configuration
  useEffect(() => {
    if (!networkInfo) return

    const newMetrics: NetworkMetrics = {
      effectiveType: networkInfo.effectiveType,
      downlink: networkInfo.downlink,
      rtt: networkInfo.rtt,
      saveData: networkInfo.saveData,
      isOnline: navigator.onLine,
      bandwidth: getBandwidthCategory(networkInfo.downlink, networkInfo.rtt)
    }

    setMetrics(newMetrics)

    // Select base configuration
    let baseConfig = DEFAULT_CONFIGS[networkInfo.effectiveType] || DEFAULT_CONFIGS['4g']

    // Apply adaptive adjustments
    const adaptedConfig = applyAdaptiveAdjustments(baseConfig, newMetrics)
    setConfig(adaptedConfig)

    // Update adaptive settings
    updateAdaptiveSettings(newMetrics)

    // Log network change for monitoring
    errorLogger.logInfo('Network conditions changed', {
      category: 'system',
      context: {
        action: 'network_change',
        metadata: {
          previousType: metrics?.effectiveType,
          newType: networkInfo.effectiveType,
          bandwidth: newMetrics.bandwidth,
          saveData: networkInfo.saveData
        }
      }
    })
  }, [networkInfo, metrics?.effectiveType])

  const getBandwidthCategory = (downlink: number, rtt: number): NetworkMetrics['bandwidth'] => {
    if (downlink >= 10 && rtt < 100) return 'high'
    if (downlink >= 1.5 && rtt < 300) return 'medium'
    if (downlink >= 0.5 && rtt < 600) return 'low'
    return 'very-low'
  }

  const applyAdaptiveAdjustments = (
    baseConfig: NetworkOptimizationConfig,
    networkMetrics: NetworkMetrics
  ): NetworkOptimizationConfig => {
    let adjustedConfig = { ...baseConfig }

    // Adjust for save data mode
    if (networkMetrics.saveData) {
      adjustedConfig.imageQuality = Math.min(adjustedConfig.imageQuality, 40)
      adjustedConfig.batchSize = Math.max(1, Math.floor(adjustedConfig.batchSize / 2))
      adjustedConfig.prefetchEnabled = false
      adjustedConfig.animationsEnabled = false
      adjustedConfig.cacheStrategy = 'aggressive'
    }

    // Adjust for high RTT (slow response times)
    if (networkMetrics.rtt > 500) {
      adjustedConfig.timeoutDuration += networkMetrics.rtt
      adjustedConfig.retryAttempts += 1
      adjustedConfig.batchSize = Math.max(1, Math.floor(adjustedConfig.batchSize / 2))
    }

    // Adjust for very low bandwidth
    if (networkMetrics.bandwidth === 'very-low') {
      adjustedConfig.imageQuality = Math.min(adjustedConfig.imageQuality, 25)
      adjustedConfig.compressionLevel = 9
      adjustedConfig.batchSize = 1
      adjustedConfig.prefetchEnabled = false
    }

    // Adjust for offline/online transitions
    if (!networkMetrics.isOnline) {
      adjustedConfig.cacheStrategy = 'aggressive'
      adjustedConfig.prefetchEnabled = false
      adjustedConfig.retryAttempts = 0
    }

    return adjustedConfig
  }

  const updateAdaptiveSettings = (networkMetrics: NetworkMetrics) => {
    setAdaptiveSettings({
      shouldReduceQuality: networkMetrics.bandwidth === 'very-low' || networkMetrics.saveData,
      shouldDisableAnimations: networkMetrics.effectiveType === 'slow-2g' || networkMetrics.saveData,
      shouldIncreaseBatching: networkMetrics.bandwidth === 'high' && !networkMetrics.saveData,
      shouldEnableCompression: networkMetrics.bandwidth !== 'high' || networkMetrics.saveData
    })
  }

  // Get optimized image URL with quality adjustment
  const getOptimizedImageUrl = useCallback((
    originalUrl: string,
    width?: number,
    height?: number
  ): string => {
    if (!originalUrl) return ''

    // For external URLs, return as-is
    if (originalUrl.startsWith('http')) return originalUrl

    // For internal images, apply optimization parameters
    const params = new URLSearchParams()
    
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', config.imageQuality.toString())
    
    if (config.compressionLevel > 5) {
      params.set('f', 'webp')
    }

    return `${originalUrl}?${params.toString()}`
  }, [config.imageQuality, config.compressionLevel])

  // Get optimized loading strategy
  const getLoadingStrategy = useCallback(() => {
    return {
      lazy: config.lazyLoadingDistance > 0,
      distance: config.lazyLoadingDistance,
      batchSize: config.batchSize,
      prefetch: config.prefetchEnabled,
      timeout: config.timeoutDuration,
      retries: config.retryAttempts
    }
  }, [config])

  // Check if feature should be enabled based on network
  const shouldEnableFeature = useCallback((feature: string): boolean => {
    switch (feature) {
      case 'animations':
        return config.animationsEnabled && !adaptiveSettings.shouldDisableAnimations
      case 'prefetch':
        return config.prefetchEnabled && metrics?.isOnline !== false
      case 'lazy-loading':
        return config.lazyLoadingDistance > 0
      case 'compression':
        return adaptiveSettings.shouldEnableCompression
      case 'high-quality-images':
        return !adaptiveSettings.shouldReduceQuality
      default:
        return true
    }
  }, [config, adaptiveSettings, metrics])

  // Get cache strategy
  const getCacheStrategy = useCallback(() => {
    return {
      strategy: config.cacheStrategy,
      maxAge: config.cacheStrategy === 'aggressive' ? 86400 : 
              config.cacheStrategy === 'normal' ? 3600 : 300,
      staleWhileRevalidate: config.cacheStrategy !== 'minimal'
    }
  }, [config.cacheStrategy])

  // Monitor and report performance issues
  const reportNetworkIssue = useCallback((issue: {
    type: 'slow_loading' | 'timeout' | 'connection_lost' | 'high_latency'
    details: Record<string, any>
  }) => {
    errorLogger.logWarning(`Network performance issue: ${issue.type}`, {
      category: 'system',
      context: {
        action: 'network_issue',
        metadata: {
          issueType: issue.type,
          networkMetrics: metrics,
          currentConfig: config,
          details: issue.details
        }
      },
      tags: ['network', 'performance', issue.type]
    })

    // Check against performance budget
    if (metrics) {
      performanceBudgetManager.checkMetric('networkLatency', metrics.rtt)
    }
  }, [metrics, config])

  // Adaptive timeout based on network conditions
  const getAdaptiveTimeout = useCallback((baseTimeout: number = 5000): number => {
    if (!metrics) return baseTimeout

    let timeout = baseTimeout

    // Increase timeout for slower networks
    switch (metrics.effectiveType) {
      case 'slow-2g':
        timeout *= 4
        break
      case '2g':
        timeout *= 3
        break
      case '3g':
        timeout *= 2
        break
      default:
        break
    }

    // Adjust for high RTT
    if (metrics.rtt > 300) {
      timeout += metrics.rtt * 2
    }

    return Math.min(timeout, 30000) // Cap at 30 seconds
  }, [metrics])

  // Network-aware retry strategy
  const getRetryStrategy = useCallback(() => {
    return {
      maxAttempts: config.retryAttempts,
      baseDelay: metrics?.effectiveType === 'slow-2g' ? 2000 : 1000,
      maxDelay: metrics?.effectiveType === 'slow-2g' ? 10000 : 5000,
      exponentialBackoff: true,
      jitter: true
    }
  }, [config.retryAttempts, metrics])

  return {
    // Current state
    config,
    metrics,
    adaptiveSettings,
    
    // Optimization functions
    getOptimizedImageUrl,
    getLoadingStrategy,
    shouldEnableFeature,
    getCacheStrategy,
    getAdaptiveTimeout,
    getRetryStrategy,
    
    // Monitoring
    reportNetworkIssue,
    
    // Computed values
    isSlowNetwork: metrics?.bandwidth === 'very-low' || metrics?.effectiveType === 'slow-2g',
    isFastNetwork: metrics?.bandwidth === 'high' && metrics?.effectiveType === '4g',
    isOffline: metrics?.isOnline === false,
    saveDataMode: metrics?.saveData === true
  }
}

// Hook for component-level network optimization
export function useComponentNetworkOptimization(componentName: string) {
  const networkOptimization = useNetworkAwareOptimization()
  const [loadingMetrics, setLoadingMetrics] = useState({
    startTime: 0,
    endTime: 0,
    duration: 0,
    success: false
  })

  const startLoading = useCallback(() => {
    setLoadingMetrics(prev => ({
      ...prev,
      startTime: performance.now(),
      success: false
    }))
  }, [])

  const endLoading = useCallback((success: boolean = true) => {
    const endTime = performance.now()
    setLoadingMetrics(prev => {
      const duration = endTime - prev.startTime
      
      // Report slow loading
      if (duration > networkOptimization.getAdaptiveTimeout()) {
        networkOptimization.reportNetworkIssue({
          type: 'slow_loading',
          details: {
            component: componentName,
            duration,
            expectedDuration: networkOptimization.getAdaptiveTimeout()
          }
        })
      }

      return {
        startTime: prev.startTime,
        endTime,
        duration,
        success
      }
    })
  }, [componentName, networkOptimization])

  return {
    ...networkOptimization,
    loadingMetrics,
    startLoading,
    endLoading
  }
}
