'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import EnhancedImage from './EnhancedImage'

interface SwipeableGalleryProps {
  images: string[]
  alt?: string
  className?: string
  showThumbnails?: boolean
  showNavigation?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  loop?: boolean
  onImageChange?: (index: number) => void
  // Data saver options
  lowQualityImages?: string[]
  mediumQualityImages?: string[]
  highQualityImages?: string[]
}

export default function SwipeableGallery({
  images,
  alt = 'Product gallery',
  className = '',
  showThumbnails = true,
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
  onImageChange,
  lowQualityImages,
  mediumQualityImages,
  highQualityImages
}: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5])
  const scale = useTransform(x, [-100, 0, 100], [0.9, 1, 0.9])

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const interval = setInterval(() => {
      if (!isDragging) {
        nextImage()
      }
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isDragging, images.length])

  // Navigation functions
  const goToImage = useCallback((index: number) => {
    if (index < 0 || index >= images.length) {
      if (loop) {
        index = index < 0 ? images.length - 1 : 0
      } else {
        return
      }
    }
    
    setCurrentIndex(index)
    onImageChange?.(index)
    x.set(0)
  }, [images.length, loop, onImageChange, x])

  const nextImage = useCallback(() => {
    goToImage(currentIndex + 1)
  }, [currentIndex, goToImage])

  const previousImage = useCallback(() => {
    goToImage(currentIndex - 1)
  }, [currentIndex, goToImage])

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(null)
    setIsDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      previousImage()
    }

    setTouchStart(null)
    setTouchEnd(null)
    setIsDragging(false)
  }, [touchStart, touchEnd, nextImage, previousImage])

  // Mouse drag handlers
  const onDragStart = useCallback((event: any, info: PanInfo) => {
    setIsDragging(true)
  }, [])

  const onDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsDragging(false)
    
    if (Math.abs(info.offset.x) > minSwipeDistance) {
      if (info.offset.x > 0) {
        previousImage()
      } else {
        nextImage()
      }
    } else {
      // Snap back to center
      x.set(0)
    }
  }, [previousImage, nextImage, x])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        previousImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previousImage, nextImage])

  // Get image source based on quality preference
  const getImageSrc = useCallback((index: number, quality: 'low' | 'medium' | 'high' = 'medium') => {
    const baseImage = images[index]
    
    switch (quality) {
      case 'low':
        return lowQualityImages?.[index] || baseImage
      case 'medium':
        return mediumQualityImages?.[index] || baseImage
      case 'high':
        return highQualityImages?.[index] || baseImage
      default:
        return baseImage
    }
  }, [images, lowQualityImages, mediumQualityImages, highQualityImages])

  if (!images.length) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main image container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        {/* Main image */}
        <motion.div
          className="relative w-full h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{ x, opacity, scale }}
        >
          <EnhancedImage
            src={getImageSrc(currentIndex, 'high')}
            alt={`${alt} ${currentIndex + 1}`}
            width={800}
            height={600}
            className="w-full h-full object-cover"
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
          />
        </motion.div>

        {/* Navigation arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm z-10">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Swipe indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-200 ${
                index === currentIndex
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:opacity-80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <EnhancedImage
                src={getImageSrc(index, 'low')}
                alt={`${alt} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover"
                loading="lazy"
                sizes="80px"
              />
              
              {/* Active indicator */}
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Touch instructions for mobile */}
      <div className="mt-2 text-center text-xs text-gray-500 md:hidden">
        Swipe left/right to navigate • Tap to zoom
      </div>
    </div>
  )
}

// Hook for gallery functionality
export function useGallery(
  images: string[],
  options: {
    autoPlay?: boolean
    autoPlayInterval?: number
    loop?: boolean
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(options.autoPlay || false)

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => {
      if (options.loop) {
        return (prev + 1) % images.length
      }
      return Math.min(prev + 1, images.length - 1)
    })
  }, [images.length, options.loop])

  const previousImage = useCallback(() => {
    setCurrentIndex((prev) => {
      if (options.loop) {
        return prev === 0 ? images.length - 1 : prev - 1
      }
      return Math.max(prev - 1, 0)
    })
  }, [images.length, options.loop])

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index)
    }
  }, [images.length])

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  return {
    currentIndex,
    isPlaying,
    nextImage,
    previousImage,
    goToImage,
    toggleAutoPlay,
    totalImages: images.length
  }
}

// Higher-order component for easy integration
export function withGallery<T extends { images: string[] }>(
  WrappedComponent: React.ComponentType<T>
) {
  return function GalleryWrapper(props: T) {
    return <SwipeableGallery {...props} />
  }
}
