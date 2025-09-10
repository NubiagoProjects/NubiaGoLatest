'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getImagePath } from '@/lib/image-utils'

interface EnhancedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onError?: () => void
}

export function EnhancedImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  fallbackSrc = '/fallback-product.jpg',
  priority = false,
  quality = 85,
  fill = false,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError
}: EnhancedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Validate and set initial image source
  useEffect(() => {
    if (src) {
      const validatedSrc = getImagePath(src)
      setImgSrc(validatedSrc)
      setHasError(false)
      setIsLoading(true)
    }
  }, [src])

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      setIsLoading(false)
      setImgSrc(fallbackSrc)
      onError?.()
    }
  }, [hasError, fallbackSrc, onError])

  const handleLoad = useCallback(() => {
    setHasError(false)
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  if (!imgSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      />
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        quality={quality}
        priority={priority}
        sizes={sizes}
        fill={fill}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: fill ? objectFit : 'contain',
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

// Product image component
export function ProductImage({
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
    <EnhancedImage
      src={src}
      alt={alt}
      width={400}
      height={400}
      className={`rounded-lg ${className}`}
      priority={priority}
      quality={75}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      objectFit="cover"
    />
  )
}

// Avatar image component
export function AvatarImage({
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
    <EnhancedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority={false}
      quality={60}
      sizes={`${size}px`}
      objectFit="cover"
    />
  )
}

// Thumbnail image component
export function ThumbnailImage({
  src,
  alt,
  className = ''
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <EnhancedImage
      src={src}
      alt={alt}
      width={120}
      height={120}
      className={`rounded ${className}`}
      priority={false}
      quality={60}
      sizes="120px"
      objectFit="cover"
    />
  )
}
