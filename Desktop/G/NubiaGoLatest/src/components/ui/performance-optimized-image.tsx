/**
 * Performance Optimized Image Component
 * Advanced image loading with lazy loading, progressive enhancement, and network awareness
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useIntersectionObserver } from '@/lib/performance'
import { errorLogger } from '@/lib/services/error-logging.service'

interface PerformanceOptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  enableLazyLoading?: boolean
  enableProgressiveLoading?: boolean
  enableNetworkOptimization?: boolean
  fallbackSrc?: string
  retryAttempts?: number
  loadingStrategy?: 'eager' | 'lazy' | 'auto'
}

interface ImageLoadState {
  isLoading: boolean
  hasLoaded: boolean
  hasError: boolean
  retryCount: number
  loadStartTime: number
  loadEndTime?: number
}

export function PerformanceOptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  enableLazyLoading = true,
  enableProgressiveLoading = true,
  enableNetworkOptimization = true,
  fallbackSrc,
  retryAttempts = 2,
  loadingStrategy = 'auto'
}: PerformanceOptimizedImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>({
    isLoading: false,
    hasLoaded: false,
    hasError: false,
    retryCount: 0,
    loadStartTime: 0
  })
  
  const [currentSrc, setCurrentSrc] = useState(src)
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [shouldLoad, setShouldLoad] = useState(!enableLazyLoading || priority)
  
  const imageRef = useRef<HTMLImageElement>(null)
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: getAdaptiveRootMargin(networkInfo)
  })

  // Network monitoring
  useEffect(() => {
    if (!enableNetworkOptimization) return

    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          saveData: connection.saveData || false
        })
      }
    }

    updateNetworkInfo()
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateNetworkInfo)
      return () => connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [enableNetworkOptimization])

  // Intersection observer logic
  useEffect(() => {
    if (!enableLazyLoading || priority) return

    if (isIntersecting || hasIntersected) {
      setShouldLoad(true)
    }
  }, [isIntersecting, hasIntersected, enableLazyLoading, priority])

  // Optimize image source based on network conditions
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (!enableNetworkOptimization || !networkInfo) return originalSrc

    const { effectiveType, saveData } = networkInfo
    let optimizedQuality = quality || 75

    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      optimizedQuality = Math.min(optimizedQuality, 50)
    } else if (effectiveType === '3g') {
      optimizedQuality = Math.min(optimizedQuality, 65)
    }

    // Add quality parameter to URL if it's a dynamic image service
    if (originalSrc.includes('?')) {
      return `${originalSrc}&q=${optimizedQuality}`
    } else if (originalSrc.includes('/api/') || originalSrc.includes('imagekit') || originalSrc.includes('cloudinary')) {
      return `${originalSrc}?q=${optimizedQuality}`
    }

    return originalSrc
  }, [enableNetworkOptimization, networkInfo, quality])

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    const loadEndTime = Date.now()
    const loadDuration = loadEndTime - loadState.loadStartTime

    setLoadState(prev => ({
      ...prev,
      isLoading: false,
      hasLoaded: true,
      hasError: false,
      loadEndTime
    }))

    // Log performance metrics
    if (loadDuration > 3000) {
      errorLogger.logWarning(`Slow image load: ${src}`, {
        category: 'ui',
        context: {
          action: 'slow_image_load',
          metadata: {
            src,
            loadDuration,
            networkInfo,
            retryCount: loadState.retryCount
          }
        },
        tags: ['performance', 'image-loading']
      })
    }

    onLoad?.()
  }, [loadState.loadStartTime, loadState.retryCount, src, networkInfo, onLoad])

  // Handle image error
  const handleImageError = useCallback(() => {
    const error = new Error(`Failed to load image: ${currentSrc}`)
    
    if (loadState.retryCount < retryAttempts) {
      // Retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, loadState.retryCount), 5000)
      
      setTimeout(() => {
        setLoadState(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
          isLoading: true,
          hasError: false,
          loadStartTime: Date.now()
        }))
        
        // Try fallback source on first retry
        if (loadState.retryCount === 0 && fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }, retryDelay)

      errorLogger.logWarning(`Image load retry ${loadState.retryCount + 1}/${retryAttempts}: ${currentSrc}`, {
        category: 'ui',
        context: {
          action: 'image_load_retry',
          metadata: { src: currentSrc, retryCount: loadState.retryCount + 1 }
        },
        tags: ['image-loading', 'retry']
      })
    } else {
      setLoadState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true
      }))

      errorLogger.logError(error, {
        category: 'ui',
        context: {
          action: 'image_load_failed',
          metadata: {
            src: currentSrc,
            fallbackSrc,
            finalRetryCount: loadState.retryCount,
            networkInfo
          }
        },
        tags: ['image-loading', 'error']
      })

      onError?.(error)
    }
  }, [currentSrc, loadState.retryCount, retryAttempts, fallbackSrc, networkInfo, onError])

  // Start loading when shouldLoad becomes true
  useEffect(() => {
    if (shouldLoad && !loadState.hasLoaded && !loadState.isLoading) {
      setLoadState(prev => ({
        ...prev,
        isLoading: true,
        loadStartTime: Date.now()
      }))
      
      const optimizedSrc = getOptimizedSrc(src)
      setCurrentSrc(optimizedSrc)
    }
  }, [shouldLoad, loadState.hasLoaded, loadState.isLoading, src, getOptimizedSrc])

  // Progressive loading placeholder
  const renderProgressivePlaceholder = () => {
    if (!enableProgressiveLoading) return null

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
    )
  }

  // Error fallback
  const renderErrorFallback = () => (
    <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
      <div className="text-center">
        <div className="mb-2">📷</div>
        <div>Image unavailable</div>
        {loadState.retryCount > 0 && (
          <div className="text-xs mt-1">Retried {loadState.retryCount} times</div>
        )}
      </div>
    </div>
  )

  // Loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="flex items-center justify-center bg-gray-100">
      {enableProgressiveLoading ? renderProgressivePlaceholder() : (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      )}
    </div>
  )

  // Determine loading strategy
  const shouldShowImage = shouldLoad && (loadState.hasLoaded || loadState.isLoading)
  const shouldShowPlaceholder = !shouldLoad || loadState.isLoading
  const shouldShowError = loadState.hasError && loadState.retryCount >= retryAttempts

  return (
    <div 
      ref={elementRef} 
      className={`performance-optimized-image relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {shouldShowError && renderErrorFallback()}
      
      {shouldShowPlaceholder && !shouldShowError && renderLoadingPlaceholder()}
      
      {shouldShowImage && !shouldShowError && (
        <Image
          ref={imageRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={`transition-opacity duration-300 ${
            loadState.hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit,
            objectPosition
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loadingStrategy === 'lazy' ? 'lazy' : loadingStrategy === 'eager' ? 'eager' : undefined}
        />
      )}
      
      {/* Loading indicator overlay */}
      {loadState.isLoading && loadState.retryCount > 0 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Retry {loadState.retryCount}/{retryAttempts}
        </div>
      )}
    </div>
  )
}

// Helper function for adaptive root margin
function getAdaptiveRootMargin(networkInfo: any): string {
  if (!networkInfo) return '50px'
  
  const { effectiveType, saveData } = networkInfo
  
  if (saveData || effectiveType === 'slow-2g') return '20px'
  if (effectiveType === '2g') return '30px'
  if (effectiveType === '3g') return '50px'
  
  return '100px'
}

// Batch image preloader
export class ImagePreloader {
  private static instance: ImagePreloader
  private preloadQueue: string[] = []
  private preloadedImages: Set<string> = new Set()
  private isProcessing = false

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader()
    }
    return ImagePreloader.instance
  }

  preload(src: string | string[], priority: 'high' | 'normal' | 'low' = 'normal') {
    const sources = Array.isArray(src) ? src : [src]
    
    sources.forEach(source => {
      if (!this.preloadedImages.has(source) && !this.preloadQueue.includes(source)) {
        if (priority === 'high') {
          this.preloadQueue.unshift(source)
        } else {
          this.preloadQueue.push(source)
        }
      }
    })

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  private async processQueue() {
    if (this.preloadQueue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true
    const src = this.preloadQueue.shift()!

    try {
      await this.preloadImage(src)
      this.preloadedImages.add(src)
    } catch (error) {
      errorLogger.logWarning(`Failed to preload image: ${src}`, {
        category: 'ui',
        context: {
          action: 'image_preload_failed',
          metadata: { src, error: error instanceof Error ? error.message : String(error) }
        },
        tags: ['image-loading', 'preload']
      })
    }

    // Continue processing with a small delay to avoid blocking
    setTimeout(() => this.processQueue(), 10)
  }

  private preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload ${src}`))
      img.src = src
    })
  }

  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src)
  }

  clearCache() {
    this.preloadedImages.clear()
    this.preloadQueue = []
  }
}

export const imagePreloader = ImagePreloader.getInstance()

// Hook for image preloading
export function useImagePreloader() {
  return {
    preload: imagePreloader.preload.bind(imagePreloader),
    isPreloaded: imagePreloader.isPreloaded.bind(imagePreloader),
    clearCache: imagePreloader.clearCache.bind(imagePreloader)
  }
}
