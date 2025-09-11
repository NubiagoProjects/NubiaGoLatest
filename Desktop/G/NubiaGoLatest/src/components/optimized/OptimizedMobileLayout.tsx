/**
 * Optimized Mobile Layout
 * Enhanced mobile layout with performance optimization and error handling
 */

'use client'

import React, { Suspense, useMemo } from 'react'
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary'
import { AdaptiveSkeleton } from '@/components/ui/adaptive-loading-skeleton'
import { useNetworkAwareOptimization } from '@/hooks/useNetworkAwareOptimization'
import { usePerformance } from '@/components/providers/performance-provider'
import { SmartLazyLoader } from '@/components/ui/smart-lazy-loader'

interface OptimizedMobileLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  navigation?: React.ReactNode
  className?: string
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
}

export function OptimizedMobileLayout({
  children,
  header,
  footer,
  navigation,
  className = '',
  enablePullToRefresh = false,
  onRefresh
}: OptimizedMobileLayoutProps) {
  const { shouldEnableFeature, isSlowNetwork } = useNetworkAwareOptimization()
  const { optimizationStrategy } = usePerformance()

  // Adaptive layout configuration
  const layoutConfig = useMemo(() => ({
    enableAnimations: shouldEnableFeature('animations'),
    enableLazyLoading: shouldEnableFeature('lazy-loading'),
    simplifiedLayout: isSlowNetwork,
    enableCodeSplitting: optimizationStrategy.enableCodeSplitting
  }), [shouldEnableFeature, isSlowNetwork, optimizationStrategy])

  const layoutClasses = useMemo(() => {
    const baseClasses = 'min-h-screen-safe bg-gray-50 flex flex-col'
    const animationClasses = layoutConfig.enableAnimations 
      ? 'transition-all duration-300' 
      : ''
    
    return `${baseClasses} ${animationClasses} ${className}`
  }, [layoutConfig.enableAnimations, className])

  return (
    <EnhancedErrorBoundary
      fallback={
        <div className="min-h-screen-safe bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              The mobile layout failed to load properly
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Reload App
            </button>
          </div>
        </div>
      }
    >
      <div className={layoutClasses}>
        {/* Header Section */}
        {header && (
          <EnhancedErrorBoundary
            fallback={
              <div className="bg-white border-b border-gray-200 p-4">
                <AdaptiveSkeleton variant="text" count={1} className="h-6" />
              </div>
            }
          >
            {layoutConfig.enableLazyLoading ? (
              <SmartLazyLoader
                loadFunction={async () => header}
                threshold={0}
                className="sticky top-0 z-50"
              >
                {({ data }: { data: React.ReactNode }) => <>{data}</>}
              </SmartLazyLoader>
            ) : (
              <div className="sticky top-0 z-50">
                {header}
              </div>
            )}
          </EnhancedErrorBoundary>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <EnhancedErrorBoundary
            fallback={
              <div className="p-4 space-y-4">
                <AdaptiveSkeleton variant="card" count={3} />
              </div>
            }
          >
            {enablePullToRefresh && onRefresh ? (
              <PullToRefreshWrapper onRefresh={onRefresh}>
                <ContentWrapper 
                  enableLazyLoading={layoutConfig.enableLazyLoading}
                  simplifiedLayout={layoutConfig.simplifiedLayout}
                >
                  {children}
                </ContentWrapper>
              </PullToRefreshWrapper>
            ) : (
              <ContentWrapper 
                enableLazyLoading={layoutConfig.enableLazyLoading}
                simplifiedLayout={layoutConfig.simplifiedLayout}
              >
                {children}
              </ContentWrapper>
            )}
          </EnhancedErrorBoundary>
        </main>

        {/* Navigation Section */}
        {navigation && (
          <EnhancedErrorBoundary
            fallback={
              <div className="bg-white border-t border-gray-200 p-2">
                <div className="flex justify-around">
                  {[...Array(4)].map((_, i) => (
                    <AdaptiveSkeleton key={i} variant="text" className="h-8 w-8 rounded" />
                  ))}
                </div>
              </div>
            }
          >
            {layoutConfig.enableCodeSplitting ? (
              <Suspense fallback={
                <div className="bg-white border-t border-gray-200 p-2">
                  <AdaptiveSkeleton variant="text" count={1} className="h-12" />
                </div>
              }>
                <div className="sticky bottom-0 z-50">
                  {navigation}
                </div>
              </Suspense>
            ) : (
              <div className="sticky bottom-0 z-50">
                {navigation}
              </div>
            )}
          </EnhancedErrorBoundary>
        )}

        {/* Footer Section */}
        {footer && (
          <EnhancedErrorBoundary
            fallback={
              <div className="bg-white border-t border-gray-200 p-4">
                <AdaptiveSkeleton variant="text" count={2} />
              </div>
            }
          >
            {footer}
          </EnhancedErrorBoundary>
        )}
      </div>
    </EnhancedErrorBoundary>
  )
}

// Content Wrapper Component
interface ContentWrapperProps {
  children: React.ReactNode
  enableLazyLoading: boolean
  simplifiedLayout: boolean
}

function ContentWrapper({ children, enableLazyLoading, simplifiedLayout }: ContentWrapperProps) {
  if (simplifiedLayout) {
    // Simplified layout for slow networks
    return (
      <div className="p-2 space-y-2">
        {children}
      </div>
    )
  }

  if (enableLazyLoading) {
    return (
      <SmartLazyLoader
        loadFunction={async () => children}
        threshold={100}
        className="h-full"
      >
        {({ data, loading }: { data: React.ReactNode, loading: boolean }) => {
          if (loading) {
            return (
              <div className="p-4 space-y-4">
                <AdaptiveSkeleton variant="card" count={2} />
              </div>
            )
          }
          return (
            <div className="h-full overflow-y-auto">
              {data}
            </div>
          )
        }}
      </SmartLazyLoader>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {children}
    </div>
  )
}

// Pull to Refresh Wrapper
interface PullToRefreshWrapperProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
}

function PullToRefreshWrapper({ children, onRefresh }: PullToRefreshWrapperProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [startY, setStartY] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (startY === 0 || containerRef.current?.scrollTop !== 0) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)
    
    if (distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, 100))
    }
  }, [startY])

  const handleTouchEnd = React.useCallback(async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setStartY(0)
    setPullDistance(0)
  }, [pullDistance, isRefreshing, onRefresh])

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="flex items-center justify-center py-4 bg-blue-50 transition-all duration-200"
          style={{ 
            transform: `translateY(${pullDistance - 60}px)`,
            opacity: pullDistance > 30 ? 1 : pullDistance / 30
          }}
        >
          <div className={`${isRefreshing ? 'animate-spin' : ''}`}>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="ml-2 text-sm text-blue-600">
            {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      
      <div style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}>
        {children}
      </div>
    </div>
  )
}

// Optimized Mobile Page Wrapper
export function OptimizedMobilePage({
  children,
  title,
  showBackButton = false,
  onBack,
  actions,
  className = ''
}: {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen-safe bg-white ${className}`}>
      {/* Page Header */}
      {(title || showBackButton || actions) && (
        <EnhancedErrorBoundary
          fallback={
            <div className="bg-white border-b border-gray-200 p-4">
              <AdaptiveSkeleton variant="text" count={1} className="h-6" />
            </div>
          }
        >
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </EnhancedErrorBoundary>
      )}

      {/* Page Content */}
      <div className="flex-1">
        <EnhancedErrorBoundary
          fallback={
            <div className="p-4 text-center">
              <p className="text-red-600">Failed to load page content</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-600 hover:text-blue-700 underline"
              >
                Reload
              </button>
            </div>
          }
        >
          {children}
        </EnhancedErrorBoundary>
      </div>
    </div>
  )
}
