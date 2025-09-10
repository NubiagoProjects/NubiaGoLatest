'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { useMobileOptimization } from '@/components/providers/mobile-optimization-provider'

interface EnhancedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  // Enhanced props for responsive images
  sizes?: string
  breakpoints?: number[]
  quality?: number
  // Format support
  formats?: ('webp' | 'avif' | 'jpeg' | 'png')[]
}

export default function EnhancedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw',
  breakpoints = [320, 480, 640, 768, 1024, 1280],
  quality = 75,
  formats = ['webp', 'avif', 'jpeg'],
  ...props
}: EnhancedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)
  const [supportsAVIF, setSupportsAVIF] = useState<boolean | null>(null)
  
  const { networkSpeed, isOnline } = useMobileOptimization()
  
  const { ref: imageRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px',
  })

  // Detect format support
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check WebP support
    const webP = document.createElement('img')
    webP.onload = webP.onerror = () => {
      setSupportsWebP(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'

    // Check AVIF support
    const avif = document.createElement('img')
    avif.onload = avif.onerror = () => {
      setSupportsAVIF(avif.height === 2)
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  }, [])

  // Generate responsive srcset
  const generateSrcSet = (baseSrc: string, format: string) => {
    if (!baseSrc || baseSrc.startsWith('data:')) return baseSrc

    const baseUrl = new URL(baseSrc, window.location.origin)
    const pathParts = baseUrl.pathname.split('.')
    const extension = pathParts.pop()
    
    // Generate different sizes for responsive images
    return breakpoints
      .map(breakpoint => {
        const scale = breakpoint / width
        const scaledWidth = Math.round(width * scale)
        const scaledHeight = Math.round(height * scale)
        
        // Create optimized URL with size and format
        const optimizedUrl = new URL(baseUrl)
        optimizedUrl.searchParams.set('w', scaledWidth.toString())
        optimizedUrl.searchParams.set('h', scaledHeight.toString())
        optimizedUrl.searchParams.set('q', quality.toString())
        optimizedUrl.searchParams.set('f', format)
        
        return `${optimizedUrl.toString()} ${breakpoint}w`
      })
      .join(', ')
  }

  // Get optimal format based on browser support and network
  const getOptimalFormat = () => {
    if (!isOnline || networkSpeed === 'slow') {
      return 'jpeg' // Use JPEG for slow networks
    }
    
    if (supportsAVIF) {
      return 'avif' // Best compression
    } else if (supportsWebP) {
      return 'webp' // Good compression, wide support
    }
    
    return 'jpeg' // Fallback
  }

  // Update current source based on format support and network
  useEffect(() => {
    if (!src) return

    const optimalFormat = getOptimalFormat()
    let optimizedSrc = src

    // Add format optimization if supported
    if (optimalFormat !== 'jpeg' && !src.includes('.svg')) {
      const url = new URL(src, window.location.origin)
      url.searchParams.set('f', optimalFormat)
      url.searchParams.set('q', quality.toString())
      optimizedSrc = url.toString()
    }

    setCurrentSrc(optimizedSrc)
  }, [src, supportsWebP, supportsAVIF, networkSpeed, isOnline, quality])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  // Generate blur placeholder
  const generateBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL
    
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(width, 32)
    canvas.height = Math.min(height, 32)
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    return canvas.toDataURL()
  }

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

  const optimalFormat = getOptimalFormat()
  const srcSet = generateSrcSet(src, optimalFormat)

  return (
    <div 
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? undefined : { width, height }}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className={`absolute inset-0 skeleton animate-pulse ${
          networkSpeed === 'slow' ? 'bg-gray-200' : 
          networkSpeed === 'medium' ? 'bg-gray-100' : 'bg-gray-50'
        }`} />
      )}

      {/* Format indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-10">
          <span className={`px-2 py-1 text-xs rounded-full text-white ${
            optimalFormat === 'avif' ? 'bg-purple-500' :
            optimalFormat === 'webp' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {optimalFormat.toUpperCase()}
          </span>
        </div>
      )}

      {/* Network indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-2 py-1 text-xs rounded-full text-white ${
            networkSpeed === 'slow' ? 'bg-red-500' :
            networkSpeed === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            {networkSpeed}
          </span>
        </div>
      )}

      {/* Image with srcset */}
      {(inView || priority) && (
        <picture>
          {/* AVIF format */}
          {supportsAVIF && optimalFormat === 'avif' && (
            <source
              type="image/avif"
              srcSet={generateSrcSet(src, 'avif')}
              sizes={sizes}
            />
          )}
          
          {/* WebP format */}
          {supportsWebP && optimalFormat === 'webp' && (
            <source
              type="image/webp"
              srcSet={generateSrcSet(src, 'webp')}
              sizes={sizes}
            />
          )}
          
          {/* Fallback image */}
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
            blurDataURL={generateBlurPlaceholder()}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${fill ? `object-${objectFit}` : ''}`}
            style={fill ? undefined : { objectFit }}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}

      {/* Loading indicator */}
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
    </div>
  )
}
