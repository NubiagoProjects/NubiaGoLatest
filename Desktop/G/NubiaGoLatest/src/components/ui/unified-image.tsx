'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { useIntersectionObserver } from '@/lib/performance'

// ============================================================================
// UNIFIED PERFORMANCE-OPTIMIZED IMAGE COMPONENT
// ============================================================================

interface UnifiedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
}

// Optimized blur data URL for better performance
const OPTIMIZED_BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

// Utility function to get optimized image path
function getOptimizedImagePath(src: string): string {
  if (src.startsWith('http') || src.startsWith('/')) {
    return src
  }
  return `/${src}`
}

const UnifiedImage = React.memo(function UnifiedImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  fallbackSrc = '/fallback-product.jpg',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL = OPTIMIZED_BLUR_DATA_URL,
  onLoad,
  onError,
  sizes,
  fill = false,
  style
}: UnifiedImageProps) {
  const [imgSrc, setImgSrc] = useState(() => getOptimizedImagePath(src))
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Use intersection observer for lazy loading
  const { elementRef: lazyRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px'
  })

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true)
      setIsLoading(false)
      setImgSrc(fallbackSrc)
      onError?.(event)
    }
  }, [hasError, fallbackSrc, onError])

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(false)
    setIsLoading(false)
    onLoad?.(event)
  }, [onLoad])

  // Determine if we should show the image
  const shouldShowImage = isIntersecting || priority

  if (!shouldShowImage) {
    return (
      <div 
        ref={lazyRef}
        className={`bg-gray-200 animate-pulse rounded ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
        aria-label={`Loading ${alt}`}
      />
    )
  }

  return (
    <div 
      ref={lazyRef}
      className={`relative ${className}`}
      style={style}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded z-10" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'object-cover' : ''}`}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        priority={priority}
        sizes={sizes}
        fill={fill}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: fill ? 'cover' : 'contain',
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 rounded">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
})

// Specialized image components for common use cases
export const ProductImage = React.memo(function ProductImage(props: Omit<UnifiedImageProps, 'sizes'>) {
  return (
    <UnifiedImage
      {...props}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={90}
    />
  )
})

export const HeroImage = React.memo(function HeroImage(props: Omit<UnifiedImageProps, 'sizes' | 'priority'>) {
  return (
    <UnifiedImage
      {...props}
      sizes="100vw"
      priority={true}
      quality={95}
    />
  )
})

export const AvatarImage = React.memo(function AvatarImage(props: Omit<UnifiedImageProps, 'sizes'>) {
  return (
    <UnifiedImage
      {...props}
      sizes="(max-width: 768px) 64px, 96px"
      quality={80}
      className={`rounded-full ${props.className || ''}`}
    />
  )
})

export const ThumbnailImage = React.memo(function ThumbnailImage(props: Omit<UnifiedImageProps, 'sizes'>) {
  return (
    <UnifiedImage
      {...props}
      sizes="(max-width: 768px) 120px, 150px"
      quality={75}
    />
  )
})

export default UnifiedImage
