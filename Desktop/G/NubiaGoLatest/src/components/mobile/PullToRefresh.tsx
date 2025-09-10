'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPull?: number
  children: React.ReactNode
  className?: string
  disabled?: boolean
  showIndicator?: boolean
}

export default function PullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  children,
  className = '',
  disabled = false,
  showIndicator = true
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  
  // Motion values for smooth animations
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, threshold], [0, 1])
  const scale = useTransform(y, [0, threshold], [0.8, 1])
  const rotate = useTransform(y, [0, threshold], [0, 180])

  // Check if we're at the top of the scrollable container
  const isAtTop = useCallback(() => {
    if (!containerRef.current) return false
    return containerRef.current.scrollTop === 0
  }, [])

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    if (disabled || isRefreshing || !isAtTop()) return
    
    startY.current = clientY
    currentY.current = clientY
  }, [disabled, isRefreshing, isAtTop])

  // Handle touch/mouse move
  const handleMove = useCallback((clientY: number) => {
    if (disabled || isRefreshing || !isAtTop()) return
    
    currentY.current = clientY
    const deltaY = currentY.current - startY.current
    
    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      event?.preventDefault?.()
      
      const pullDistance = Math.min(deltaY * 0.5, maxPull)
      y.set(pullDistance)
      
      // Enable refresh when threshold is reached
      if (pullDistance >= threshold) {
        setCanRefresh(true)
      } else {
        setCanRefresh(false)
      }
    }
  }, [disabled, isRefreshing, isAtTop, threshold, maxPull, y])

  // Handle touch/mouse end
  const handleEnd = useCallback(async () => {
    if (disabled || isRefreshing || !canRefresh) {
      // Reset position if refresh not triggered
      y.set(0)
      setCanRefresh(false)
      return
    }

    // Trigger refresh
    setIsRefreshing(true)
    y.set(threshold) // Keep at threshold while refreshing
    
    try {
      await onRefresh()
    } catch (error) {
      console.error('Pull to refresh failed:', error)
    } finally {
      setIsRefreshing(false)
      y.set(0)
      setCanRefresh(false)
    }
  }, [disabled, isRefreshing, canRefresh, threshold, y, onRefresh])

  // Touch event handlers
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isTracking = false

    const handleTouchStart = (e: TouchEvent) => {
      if (isAtTop()) {
        isTracking = true
        handleStart(e.touches[0].clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isTracking && isAtTop()) {
        handleMove(e.touches[0].clientY)
      }
    }

    const handleTouchEnd = () => {
      if (isTracking) {
        isTracking = false
        handleEnd()
      }
    }

    // Mouse event handlers for desktop testing
    const handleMouseDown = (e: MouseEvent) => {
      if (isAtTop()) {
        isTracking = true
        handleStart(e.clientY)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isTracking && isAtTop()) {
        handleMove(e.clientY)
      }
    }

    const handleMouseUp = () => {
      if (isTracking) {
        isTracking = false
        handleEnd()
      }
    }

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleStart, handleMove, handleEnd, isAtTop])

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull to refresh indicator */}
      {showIndicator && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
          style={{ y, opacity }}
        >
          <div className="bg-white rounded-full shadow-lg p-3 flex items-center space-x-2">
            <motion.div
              className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              style={{ rotate, scale }}
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Overlay when refreshing */}
      {isRefreshing && (
        <motion.div
          className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-medium">Refreshing...</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: {
    threshold?: number
    maxPull?: number
    disabled?: boolean
  } = {}
) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [canRefresh, setCanRefresh] = useState(false)

  const { threshold = 80, maxPull = 120, disabled = false } = options

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } catch (error) {
      console.error('Pull to refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [disabled, isRefreshing, onRefresh])

  const updatePullDistance = useCallback((distance: number) => {
    const clampedDistance = Math.min(distance, maxPull)
    setPullDistance(clampedDistance)
    setCanRefresh(clampedDistance >= threshold)
  }, [maxPull, threshold])

  const resetPull = useCallback(() => {
    setPullDistance(0)
    setCanRefresh(false)
  }, [])

  return {
    isRefreshing,
    pullDistance,
    canRefresh,
    handleRefresh,
    updatePullDistance,
    resetPull
  }
}

// Higher-order component for easy integration
export function withPullToRefresh<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  refreshFunction: () => Promise<void>
) {
  return function PullToRefreshWrapper(props: T) {
    return (
      <PullToRefresh onRefresh={refreshFunction}>
        <WrappedComponent {...props} />
      </PullToRefresh>
    )
  }
}
