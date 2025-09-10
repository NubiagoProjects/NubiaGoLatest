'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'

interface LazyImageProps {
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
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref: imageRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
  })

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        Loading...
      </text>
    </svg>`
  ).toString('base64')}`

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
        style={{ width, height }}
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
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton animate-pulse bg-gray-200" />
      )}

      {/* Image - only render when in view or priority */}
      {(inView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${fill ? `object-${objectFit}` : ''}`}
          style={fill ? undefined : { objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Loading indicator for slow connections */}
      {!isLoaded && (inView || priority) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Loading image...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Higher-order component for progressive image enhancement
export function withProgressiveEnhancement<T extends LazyImageProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ProgressiveImage(props: T) {
    const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)

    React.useEffect(() => {
      // Check WebP support
      const webP = document.createElement('img')
      webP.onload = webP.onerror = () => {
        setSupportsWebP(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    }, [])

    // Enhance src based on browser capabilities
    const enhancedProps = {
      ...props,
      src: supportsWebP && !props.src.includes('.svg') 
        ? props.src.replace(/\.(jpg|jpeg|png)$/i, '.webp') 
        : props.src
    }

    return <WrappedComponent {...enhancedProps} />
  }
}

export const ProgressiveLazyImage = withProgressiveEnhancement(LazyImage)
