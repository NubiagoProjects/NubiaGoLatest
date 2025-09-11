/**
 * Adaptive Loading Skeleton System
 * Smart skeleton components that adapt to network conditions and content types
 */

'use client'

import React, { useMemo } from 'react'
import { usePerformance } from '@/components/providers/performance-provider'

interface AdaptiveSkeletonProps {
  variant: 'product' | 'text' | 'image' | 'card' | 'list' | 'table' | 'form'
  count?: number
  className?: string
  animate?: boolean
  showProgress?: boolean
  estimatedLoadTime?: number
}

export function AdaptiveSkeleton({
  variant,
  count = 1,
  className = '',
  animate = true,
  showProgress = false,
  estimatedLoadTime
}: AdaptiveSkeletonProps) {
  const { networkInfo, optimizationStrategy } = usePerformance()

  // Adapt animation based on network conditions
  const shouldAnimate = useMemo(() => {
    if (!animate) return false
    
    // Disable animations on very slow networks to save battery/CPU
    if (networkInfo?.effectiveType === 'slow-2g' || networkInfo?.saveData) {
      return false
    }
    
    return true
  }, [animate, networkInfo])

  // Adapt skeleton complexity based on network
  const skeletonComplexity = useMemo(() => {
    if (networkInfo?.effectiveType === 'slow-2g' || networkInfo?.saveData) {
      return 'minimal'
    }
    if (networkInfo?.effectiveType === '2g' || networkInfo?.effectiveType === '3g') {
      return 'simple'
    }
    return 'detailed'
  }, [networkInfo])

  const baseClasses = `bg-gray-200 rounded ${shouldAnimate ? 'animate-pulse' : ''}`
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'product':
        return <ProductSkeleton complexity={skeletonComplexity} />
      case 'text':
        return <TextSkeleton complexity={skeletonComplexity} />
      case 'image':
        return <ImageSkeleton complexity={skeletonComplexity} />
      case 'card':
        return <CardSkeleton complexity={skeletonComplexity} />
      case 'list':
        return <ListSkeleton complexity={skeletonComplexity} />
      case 'table':
        return <TableSkeleton complexity={skeletonComplexity} />
      case 'form':
        return <FormSkeleton complexity={skeletonComplexity} />
      default:
        return <div className={`${baseClasses} h-4 w-3/4`} />
    }
  }

  return (
    <div className={`adaptive-skeleton ${className}`}>
      {showProgress && estimatedLoadTime && (
        <ProgressIndicator estimatedTime={estimatedLoadTime} />
      )}
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={i > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Specialized skeleton components
function ProductSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  
  if (complexity === 'minimal') {
    return (
      <div className="space-y-2">
        <div className={`${baseClasses} h-32 w-full`} />
        <div className={`${baseClasses} h-4 w-3/4`} />
        <div className={`${baseClasses} h-4 w-1/2`} />
      </div>
    )
  }
  
  if (complexity === 'simple') {
    return (
      <div className="space-y-3">
        <div className={`${baseClasses} h-40 w-full`} />
        <div className={`${baseClasses} h-3 w-1/4`} />
        <div className={`${baseClasses} h-4 w-3/4`} />
        <div className={`${baseClasses} h-5 w-1/3`} />
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`${baseClasses} h-3 w-3 rounded-full`} />
          ))}
        </div>
      </div>
    )
  }
  
  // Detailed skeleton
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`${baseClasses} h-48 w-full`} />
      <div className="p-4 space-y-3">
        <div className={`${baseClasses} h-3 w-1/4`} />
        <div className={`${baseClasses} h-5 w-3/4`} />
        <div className={`${baseClasses} h-6 w-1/3`} />
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`${baseClasses} h-4 w-4 rounded-full`} />
            ))}
          </div>
          <div className={`${baseClasses} h-8 w-8 rounded-full`} />
        </div>
        <div className="flex space-x-2">
          <div className={`${baseClasses} h-9 flex-1`} />
          <div className={`${baseClasses} h-9 w-9`} />
        </div>
      </div>
    </div>
  )
}

function TextSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  
  if (complexity === 'minimal') {
    return (
      <div className="space-y-2">
        <div className={`${baseClasses} h-4 w-full`} />
        <div className={`${baseClasses} h-4 w-3/4`} />
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      <div className={`${baseClasses} h-4 w-full`} />
      <div className={`${baseClasses} h-4 w-5/6`} />
      <div className={`${baseClasses} h-4 w-4/5`} />
      <div className={`${baseClasses} h-4 w-3/4`} />
    </div>
  )
}

function ImageSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 animate-pulse'
  
  return (
    <div className={`${baseClasses} aspect-video w-full rounded-lg flex items-center justify-center`}>
      {complexity !== 'minimal' && (
        <div className="text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}

function CardSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  
  if (complexity === 'minimal') {
    return (
      <div className="p-4 border rounded-lg space-y-3">
        <div className={`${baseClasses} h-4 w-1/2`} />
        <div className={`${baseClasses} h-3 w-full`} />
        <div className={`${baseClasses} h-3 w-3/4`} />
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`${baseClasses} h-10 w-10 rounded-full`} />
        <div className="space-y-2 flex-1">
          <div className={`${baseClasses} h-4 w-1/3`} />
          <div className={`${baseClasses} h-3 w-1/4`} />
        </div>
      </div>
      <div className="space-y-2">
        <div className={`${baseClasses} h-4 w-full`} />
        <div className={`${baseClasses} h-4 w-5/6`} />
        <div className={`${baseClasses} h-4 w-3/4`} />
      </div>
      {complexity === 'detailed' && (
        <div className="flex space-x-2 pt-2">
          <div className={`${baseClasses} h-8 w-16`} />
          <div className={`${baseClasses} h-8 w-16`} />
        </div>
      )}
    </div>
  )
}

function ListSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  const itemCount = complexity === 'minimal' ? 3 : complexity === 'simple' ? 5 : 8
  
  return (
    <div className="space-y-3">
      {[...Array(itemCount)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className={`${baseClasses} h-8 w-8 rounded-full`} />
          <div className="flex-1 space-y-1">
            <div className={`${baseClasses} h-4 w-3/4`} />
            {complexity !== 'minimal' && (
              <div className={`${baseClasses} h-3 w-1/2`} />
            )}
          </div>
          {complexity === 'detailed' && (
            <div className={`${baseClasses} h-6 w-16`} />
          )}
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  const rowCount = complexity === 'minimal' ? 3 : 5
  const colCount = complexity === 'minimal' ? 3 : complexity === 'simple' ? 4 : 6
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
        {[...Array(colCount)].map((_, i) => (
          <div key={i} className={`${baseClasses} h-4 w-full`} />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rowCount)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {[...Array(colCount)].map((_, colIndex) => (
            <div key={colIndex} className={`${baseClasses} h-3 w-full`} />
          ))}
        </div>
      ))}
    </div>
  )
}

function FormSkeleton({ complexity }: { complexity: string }) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse'
  
  if (complexity === 'minimal') {
    return (
      <div className="space-y-4">
        <div className={`${baseClasses} h-10 w-full`} />
        <div className={`${baseClasses} h-10 w-full`} />
        <div className={`${baseClasses} h-10 w-1/3`} />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className={`${baseClasses} h-6 w-1/4`} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className={`${baseClasses} h-4 w-1/3`} />
          <div className={`${baseClasses} h-10 w-full`} />
        </div>
        <div className="space-y-2">
          <div className={`${baseClasses} h-4 w-1/4`} />
          <div className={`${baseClasses} h-10 w-full`} />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className={`${baseClasses} h-4 w-1/5`} />
        <div className={`${baseClasses} h-10 w-full`} />
      </div>
      
      {complexity === 'detailed' && (
        <div className="space-y-2">
          <div className={`${baseClasses} h-4 w-1/6`} />
          <div className={`${baseClasses} h-24 w-full`} />
        </div>
      )}
      
      <div className="flex space-x-3">
        <div className={`${baseClasses} h-10 w-24`} />
        <div className={`${baseClasses} h-10 w-20`} />
      </div>
    </div>
  )
}

// Progress indicator for estimated load times
function ProgressIndicator({ estimatedTime }: { estimatedTime: number }) {
  const [progress, setProgress] = React.useState(0)
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (estimatedTime / 100)
        return Math.min(prev + increment, 95) // Cap at 95% until actual load
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [estimatedTime])
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Loading...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Skeleton wrapper with intersection observer
export function LazySkeletonWrapper({
  children,
  skeleton,
  className = ''
}: {
  children: React.ReactNode
  skeleton: React.ReactNode
  className?: string
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  React.useEffect(() => {
    if (isVisible) {
      // Simulate loading delay
      const timer = setTimeout(() => setHasLoaded(true), 500)
      return () => clearTimeout(timer)
    }
  }, [isVisible])
  
  return (
    <div ref={ref} className={className}>
      {hasLoaded ? children : skeleton}
    </div>
  )
}
