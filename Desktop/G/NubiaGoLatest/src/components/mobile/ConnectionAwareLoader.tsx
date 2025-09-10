'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { offlineStorage } from '@/lib/offlineStorage'

interface ConnectionAwareLoaderProps<T> {
  loadFunction: () => Promise<T>
  cacheKey?: string
  fallbackData?: T
  children: (data: T | null, loading: boolean, error: Error | null, retry: () => void) => React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode
  offlineComponent?: React.ReactNode
  enableOfflineFirst?: boolean
  maxRetries?: number
  retryDelay?: number
}

export function ConnectionAwareLoader<T>({
  loadFunction,
  cacheKey,
  fallbackData,
  children,
  loadingComponent,
  errorComponent,
  offlineComponent,
  enableOfflineFirst = true,
  maxRetries = 3,
  retryDelay = 1000,
}: ConnectionAwareLoaderProps<T>) {
  const [data, setData] = useState<T | null>(fallbackData || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const { networkInfo, isSlowConnection, estimatedSpeed } = useNetworkStatus()

  const loadData = useCallback(async (fromCache = false) => {
    try {
      setLoading(true)
      setError(null)

      // Try cache first if enabled
      if (enableOfflineFirst && cacheKey && !fromCache) {
        try {
          const cached = await offlineStorage.getProduct(cacheKey)
          if (cached) {
            setData(cached)
            setLoading(false)
            
            // Load fresh data in background if online
            if (networkInfo.online) {
              loadData(true).catch(console.warn)
            }
            return
          }
        } catch (cacheError) {
          console.warn('Cache read failed:', cacheError)
        }
      }

      // Network request with timeout based on connection speed
      const timeoutMs = isSlowConnection ? 30000 : 10000
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const result = await Promise.race([
          loadFunction(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
          })
        ])

        clearTimeout(timeoutId)
        setData(result)
        
        // Cache successful result
        if (cacheKey && result) {
          try {
            await offlineStorage.cacheProducts([{ id: cacheKey, ...result }])
          } catch (cacheError) {
            console.warn('Failed to cache data:', cacheError)
          }
        }
        
        setRetryCount(0)
      } catch (loadError) {
        clearTimeout(timeoutId)
        throw loadError
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      
      // Auto-retry with exponential backoff for network errors
      if (retryCount < maxRetries && networkInfo.online) {
        const delay = retryDelay * Math.pow(2, retryCount)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadData(fromCache)
        }, delay)
      }
    } finally {
      setLoading(false)
    }
  }, [loadFunction, cacheKey, enableOfflineFirst, networkInfo.online, isSlowConnection, retryCount, maxRetries, retryDelay])

  const retry = useCallback(() => {
    setRetryCount(0)
    loadData()
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Show offline component if offline and no cached data
  if (!networkInfo.online && !data && offlineComponent) {
    return <>{offlineComponent}</>
  }

  // Show error component if error and no cached data
  if (error && !data && errorComponent) {
    return <>{errorComponent(error, retry)}</>
  }

  // Show loading component if loading and no cached data
  if (loading && !data && loadingComponent) {
    return <>{loadingComponent}</>
  }

  return <>{children(data, loading, error, retry)}</>
}

// Adaptive image loader based on connection
interface AdaptiveImageLoaderProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  onLoad?: (url: string, size: number) => void
}

export function AdaptiveImageLoader({
  src,
  alt,
  width,
  height,
  className = '',
  onLoad,
}: AdaptiveImageLoaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState(0)
  const { shouldOptimizeImages, estimatedSpeed, isSlowConnection } = useNetworkStatus()

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Check cache first
        const cached = await offlineStorage.getCachedImageUrl(src)
        if (cached) {
          setImageUrl(cached)
          return
        }

        // Determine optimal image quality based on connection
        let quality = 75
        let targetWidth = width

        if (shouldOptimizeImages) {
          quality = isSlowConnection ? 50 : 65
          targetWidth = Math.min(width, 600)
        } else if (estimatedSpeed > 5) {
          quality = 90
        }

        // Generate optimized URL
        const optimizedUrl = `${src}?q=${quality}&w=${targetWidth}`
        
        // Preload and measure
        const img = new Image()
        img.onload = () => {
          setImageUrl(optimizedUrl)
          
          // Estimate size
          const estimatedSize = (targetWidth * height * quality) / 100
          setImageSize(estimatedSize)
          onLoad?.(optimizedUrl, estimatedSize)
        }
        img.src = optimizedUrl
      } catch (error) {
        console.warn('Failed to load adaptive image:', error)
        setImageUrl(src) // Fallback to original
      }
    }

    loadImage()
  }, [src, width, height, shouldOptimizeImages, isSlowConnection, estimatedSpeed, onLoad])

  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-sm">
            {isSlowConnection ? 'Optimizing...' : 'Loading...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  )
}

// Batch loader for multiple items with connection awareness
interface BatchLoaderProps<T> {
  items: string[]
  loadFunction: (id: string) => Promise<T>
  batchSize?: number
  children: (loadedItems: Map<string, T>, loading: Set<string>, errors: Map<string, Error>) => React.ReactNode
}

export function BatchLoader<T>({
  items,
  loadFunction,
  batchSize,
  children,
}: BatchLoaderProps<T>) {
  const [loadedItems, setLoadedItems] = useState<Map<string, T>>(new Map())
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Map<string, Error>>(new Map())
  
  const { isSlowConnection, estimatedSpeed } = useNetworkStatus()

  // Adaptive batch size based on connection
  const adaptiveBatchSize = batchSize || (isSlowConnection ? 2 : estimatedSpeed > 5 ? 8 : 4)

  useEffect(() => {
    const loadBatch = async (batch: string[]) => {
      // Mark items as loading
      setLoading(prev => new Set([...prev, ...batch]))

      // Load items concurrently with connection-aware timeout
      const timeout = isSlowConnection ? 15000 : 8000
      const promises = batch.map(async (id) => {
        try {
          const result = await Promise.race([
            loadFunction(id),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Timeout')), timeout)
            })
          ])
          
          setLoadedItems(prev => new Map(prev.set(id, result)))
          setErrors(prev => {
            const newErrors = new Map(prev)
            newErrors.delete(id)
            return newErrors
          })
        } catch (error) {
          setErrors(prev => new Map(prev.set(id, error instanceof Error ? error : new Error('Unknown error'))))
        } finally {
          setLoading(prev => {
            const newLoading = new Set(prev)
            newLoading.delete(id)
            return newLoading
          })
        }
      })

      await Promise.allSettled(promises)
    }

    // Process items in batches
    const processBatches = async () => {
      for (let i = 0; i < items.length; i += adaptiveBatchSize) {
        const batch = items.slice(i, i + adaptiveBatchSize)
        await loadBatch(batch)
        
        // Add delay between batches for slow connections
        if (isSlowConnection && i + adaptiveBatchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }

    processBatches()
  }, [items, loadFunction, adaptiveBatchSize, isSlowConnection])

  return <>{children(loadedItems, loading, errors)}</>
}

// Priority-based loader that loads critical content first
interface PriorityLoaderProps {
  critical: Array<{ key: string; loadFunction: () => Promise<any> }>
  normal: Array<{ key: string; loadFunction: () => Promise<any> }>
  children: (criticalData: Map<string, any>, normalData: Map<string, any>, allLoaded: boolean) => React.ReactNode
}

export function PriorityLoader({
  critical,
  normal,
  children,
}: PriorityLoaderProps) {
  const [criticalData, setCriticalData] = useState<Map<string, any>>(new Map())
  const [normalData, setNormalData] = useState<Map<string, any>>(new Map())
  const [criticalLoaded, setCriticalLoaded] = useState(false)
  const [normalLoaded, setNormalLoaded] = useState(false)
  
  const { isSlowConnection } = useNetworkStatus()

  useEffect(() => {
    // Load critical items first
    const loadCritical = async () => {
      const promises = critical.map(async ({ key, loadFunction }) => {
        try {
          const result = await loadFunction()
          setCriticalData(prev => new Map(prev.set(key, result)))
        } catch (error) {
          console.warn(`Failed to load critical item ${key}:`, error)
        }
      })

      await Promise.allSettled(promises)
      setCriticalLoaded(true)
    }

    // Load normal items after critical (or with delay on slow connections)
    const loadNormal = async () => {
      // Wait for critical items on slow connections
      if (isSlowConnection) {
        await new Promise(resolve => {
          const checkCritical = () => {
            if (criticalLoaded) {
              resolve(void 0)
            } else {
              setTimeout(checkCritical, 100)
            }
          }
          checkCritical()
        })
      }

      const promises = normal.map(async ({ key, loadFunction }) => {
        try {
          const result = await loadFunction()
          setNormalData(prev => new Map(prev.set(key, result)))
        } catch (error) {
          console.warn(`Failed to load normal item ${key}:`, error)
        }
      })

      await Promise.allSettled(promises)
      setNormalLoaded(true)
    }

    loadCritical()
    loadNormal()
  }, [critical, normal, isSlowConnection, criticalLoaded])

  return <>{children(criticalData, normalData, criticalLoaded && normalLoaded)}</>
}
