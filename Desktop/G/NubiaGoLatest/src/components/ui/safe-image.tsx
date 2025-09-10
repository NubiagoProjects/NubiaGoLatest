'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getImagePath } from '@/lib/image-utils'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  priority?: boolean
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export function SafeImage({ 
  src, 
  alt, 
  width = 300, 
  height = 300, 
  className = '', 
  fallback = '/fallback-product.jpg',
  priority = false,
  onLoad,
  onError
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
      onError?.(event)
    }
  }

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(false)
    onLoad?.(event)
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}

// Simple img tag version for cases where Next.js Image isn't suitable
export function SafeImg({
  src,
  alt,
  className = '',
  fallback = '/fallback-product.jpg',
  onError,
  onLoad,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string
}) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (src) {
      const validatedSrc = getImagePath(src.split('/').pop() || '')
      setImageSrc(validatedSrc)
      setHasError(false)
    }
  }, [src])

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallback)
      onError?.(event)
    }
  }

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(false)
    onLoad?.(event)
  }

  return (
    <img
      src={imageSrc || fallback}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  )
} 
