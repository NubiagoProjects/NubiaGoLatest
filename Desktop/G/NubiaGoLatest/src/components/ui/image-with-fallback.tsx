'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useLazyImage, useIntersectionObserver } from '@/lib/performance'

// ============================================================================
// PERFORMANCE OPTIMIZED IMAGE COMPONENT
// ============================================================================

interface ImageWithFallbackProps {
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

// Utility function to get image path
function getImagePath(filename: string): string {
  if (filename.startsWith('http')) {
    return filename
  }
  if (filename.startsWith('/')) {
    return filename
  }
  return `/${filename}`
}

// Preload image function
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      resolve()
      return
    }
    
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export function ImageWithFallback({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  fallbackSrc = '/fallback-product.jpg',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  onLoad,
  onError,
  sizes,
  fill = false,
  style
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreloaded, setIsPreloaded] = useState(false)

  // Use performance hooks
  const { elementRef: lazyRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px'
  })

  // Validate and set initial image source
  useEffect(() => {
    if (src) {
      const validatedSrc = src.startsWith('http') ? src : getImagePath(src)
      setImgSrc(validatedSrc)
      setHasError(false)
      setIsLoading(true)
    }
  }, [src])

  // Preload image for better performance
  useEffect(() => {
    if (imgSrc && !hasError && isIntersecting) {
      preloadImage(imgSrc)
        .then(() => {
          setIsPreloaded(true)
        })
        .catch(() => {
          // If preloading fails, we'll handle it in the onError
          console.warn('Failed to preload image:', imgSrc)
        })
    }
  }, [imgSrc, hasError, isIntersecting])

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
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
      />
    )
  }

  return (
    <div 
      ref={lazyRef}
      className={`relative ${className}`}
      style={style}
    >
      {isLoading && !isPreloaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        src={imgSrc || fallbackSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`transition-opacity duration-300 ${
          isLoading || !isPreloaded ? 'opacity-0' : 'opacity-100'
        }`}
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}

// Optimized image component for product thumbnails
export function OptimizedProductImage({
  src,
  alt,
  className = '',
  priority = false
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={400}
      height={400}
      className={`rounded-lg ${className}`}
      priority={priority}
      quality={75}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

// Optimized image component for hero/banner images
export function OptimizedHeroImage({
  src,
  alt,
  className = '',
  priority = true
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority={priority}
      quality={90}
      placeholder="blur"
      sizes="100vw"
    />
  )
}

// Optimized image component for avatars
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = ''
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority={false}
      quality={60}
      placeholder="blur"
      sizes={`${size}px`}
    />
  )
} 
