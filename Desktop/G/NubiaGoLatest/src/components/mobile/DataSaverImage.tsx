'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'

interface DataSaverImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  // Data saver specific props
  lowQualitySrc?: string
  mediumQualitySrc?: string
  highQualitySrc?: string
  networkThreshold?: 'slow' | 'medium' | 'fast'
}

export default function DataSaverImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw',
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  lowQualitySrc,
  mediumQualitySrc,
  highQualitySrc,
  networkThreshold = 'medium',
  ...props
}: DataSaverImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
  const { ref: imageRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px', // Increased for better preloading
  })

  // Network speed detection
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection.effectiveType) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setNetworkSpeed('slow')
        } else if (effectiveType === '3g') {
          setNetworkSpeed('medium')
        } else {
          setNetworkSpeed('fast')
        }
      }
      
      // Listen for network changes
      const handleNetworkChange = () => {
        if (connection.effectiveType) {
          const effectiveType = connection.effectiveType
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            setNetworkSpeed('slow')
          } else if (effectiveType === '3g') {
            setNetworkSpeed('medium')
          } else {
            setNetworkSpeed('fast')
          }
        }
      }
      
      connection.addEventListener('change', handleNetworkChange)
      return () => connection.removeEventListener('change', handleNetworkChange)
    }
  }, [])

  // Determine image quality based on network speed
  useEffect(() => {
    let qualitySrc = src
    
    if (networkSpeed === 'slow' && lowQualitySrc) {
      qualitySrc = lowQualitySrc
    } else if (networkSpeed === 'medium' && mediumQualitySrc) {
      qualitySrc = mediumQualitySrc
    } else if (networkSpeed === 'fast' && highQualitySrc) {
      qualitySrc = highQualitySrc
    }
    
    setCurrentSrc(qualitySrc)
  }, [networkSpeed, src, lowQualitySrc, mediumQualitySrc, highQualitySrc])

  // Generate optimized blur placeholder
  const generateBlurPlaceholder = () => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(width, 32)
    canvas.height = Math.min(height, 32)
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Create a simple gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add loading text
      ctx.fillStyle = '#9ca3af'
      ctx.font = '8px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2)
    }
    
    return canvas.toDataURL()
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  // Fallback image for errors
  const fallbackSrc = '/fallback-product.jpg'

  if (hasError) {
    return (
      <div 
        ref={imageRef}
        className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">Image not available</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? undefined : { width, height }}
    >
      {/* Loading skeleton with network-aware styling */}
      {!isLoaded && (
        <div className={`absolute inset-0 skeleton animate-pulse ${
          networkSpeed === 'slow' ? 'bg-gray-200' : 
          networkSpeed === 'medium' ? 'bg-gray-100' : 'bg-gray-50'
        }`} />
      )}

      {/* Network speed indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-10">
          <span className={`px-2 py-1 text-xs rounded-full text-white ${
            networkSpeed === 'slow' ? 'bg-red-500' :
            networkSpeed === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            {networkSpeed}
          </span>
        </div>
      )}

      {/* Image - only render when in view or priority */}
      {(inView || priority) && (
        <Image
          src={currentSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL || generateBlurPlaceholder()}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${fill ? `object-${objectFit}` : ''}`}
          style={fill ? undefined : { objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Loading indicator with network-aware messaging */}
      {!isLoaded && (inView || priority) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">
              {networkSpeed === 'slow' ? 'Loading (slow network)...' :
               networkSpeed === 'medium' ? 'Loading...' : 'Loading image...'}
            </p>
          </div>
        </div>
      )}

      {/* Progressive enhancement indicator */}
      {networkSpeed === 'slow' && (lowQualitySrc || mediumQualitySrc) && (
        <div className="absolute bottom-2 right-2 z-10">
          <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            Data Saver
          </div>
        </div>
      )}
    </div>
  )
}

// Higher-order component for automatic quality selection
export function withAutomaticQuality<T extends DataSaverImageProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function AutomaticQualityImage(props: T) {
    const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)

    useEffect(() => {
      // Check WebP support
      const webP = document.createElement('img')
      webP.onload = webP.onerror = () => {
        setSupportsWebP(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    }, [])

    // Automatically generate quality variants if not provided
    const enhancedProps = {
      ...props,
      lowQualitySrc: props.lowQualitySrc || props.src.replace(/\.(jpg|jpeg|png)$/i, '-low.$1'),
      mediumQualitySrc: props.mediumQualitySrc || props.src.replace(/\.(jpg|jpeg|png)$/i, '-medium.$1'),
      highQualitySrc: props.highQualitySrc || props.src.replace(/\.(jpg|jpeg|png)$/i, '-high.$1'),
      src: supportsWebP && !props.src.includes('.svg') 
        ? props.src.replace(/\.(jpg|jpeg|png)$/i, '.webp') 
        : props.src
    }

    return <WrappedComponent {...enhancedProps} />
  }
}

export const AutomaticQualityImage = withAutomaticQuality(DataSaverImage)
