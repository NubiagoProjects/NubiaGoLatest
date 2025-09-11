/**
 * Optimized Product Grid
 * Enhanced product grid with smart lazy loading, error boundaries, and performance optimization
 */

'use client'

import React, { useMemo, useCallback } from 'react'
import { Product } from '@/types'
import { SmartLazyLoader } from '@/components/ui/smart-lazy-loader'
import { AdaptiveSkeleton } from '@/components/ui/adaptive-loading-skeleton'
import { PerformanceOptimizedImage } from '@/components/ui/performance-optimized-image'
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary'
import { useNetworkAwareOptimization } from '@/hooks/useNetworkAwareOptimization'
import { usePerformance } from '@/components/providers/performance-provider'
import { useLoadingStore } from '@/lib/services/unified-loading.service'
import { Star, Heart, ShoppingCart, Share2 } from 'lucide-react'

interface OptimizedProductGridProps {
  products: Product[]
  loading?: boolean
  error?: string | null
  onProductClick?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
  onShare?: (product: Product) => void
  className?: string
  columns?: 2 | 3 | 4
  showFilters?: boolean
}

export function OptimizedProductGrid({
  products,
  loading = false,
  error = null,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  onShare,
  className = '',
  columns = 2,
  showFilters = false
}: OptimizedProductGridProps) {
  const { shouldEnableFeature, getLoadingStrategy } = useNetworkAwareOptimization()
  const { optimizationStrategy } = usePerformance()
  const { startLoading, stopLoading } = useLoadingStore()

  // Adaptive grid configuration based on network and device
  const gridConfig = useMemo(() => {
    const strategy = getLoadingStrategy()
    
    return {
      batchSize: strategy.batchSize,
      lazyDistance: strategy.distance,
      enableAnimations: shouldEnableFeature('animations'),
      enablePrefetch: shouldEnableFeature('prefetch'),
      columns: optimizationStrategy.enableCodeSplitting ? columns : Math.min(columns, 2)
    }
  }, [getLoadingStrategy, shouldEnableFeature, optimizationStrategy, columns])

  // Memoized product batches for efficient rendering
  const productBatches = useMemo(() => {
    const batches: Product[][] = []
    for (let i = 0; i < products.length; i += gridConfig.batchSize) {
      batches.push(products.slice(i, i + gridConfig.batchSize))
    }
    return batches
  }, [products, gridConfig.batchSize])

  const handleProductAction = useCallback(async (
    action: 'click' | 'cart' | 'wishlist' | 'share',
    product: Product
  ) => {
    const loadingId = `product-${action}-${product.id}`
    
    try {
      startLoading(loadingId, `${action} product`)
      
      switch (action) {
        case 'click':
          onProductClick?.(product)
          break
        case 'cart':
          onAddToCart?.(product)
          break
        case 'wishlist':
          onAddToWishlist?.(product)
          break
        case 'share':
          onShare?.(product)
          break
      }
    } finally {
      stopLoading(loadingId)
    }
  }, [startLoading, stopLoading, onProductClick, onAddToCart, onAddToWishlist, onShare])

  if (error) {
    return (
      <EnhancedErrorBoundary
        fallback={
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load products</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        }
      >
        <div className="text-red-600">{error}</div>
      </EnhancedErrorBoundary>
    )
  }

  if (loading || products.length === 0) {
    return (
      <div className={`grid grid-cols-${gridConfig.columns} gap-4 ${className}`}>
        <AdaptiveSkeleton 
          variant="product" 
          count={gridConfig.batchSize} 
          animate={gridConfig.enableAnimations}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {productBatches.map((batch, batchIndex) => (
        <SmartLazyLoader
          key={batchIndex}
          loadFunction={async () => batch}
          threshold={gridConfig.lazyDistance}
          enableRetry={true}
          batchSize={gridConfig.batchSize}
          className="w-full"
        >
          {({ data: batchProducts, loading: batchLoading, error: batchError }) => (
            <EnhancedErrorBoundary
              fallback={
                <div className="text-center py-4">
                  <p className="text-gray-600">Failed to load this batch of products</p>
                </div>
              }
            >
              {batchLoading ? (
                <div className={`grid grid-cols-${gridConfig.columns} gap-4`}>
                  <AdaptiveSkeleton 
                    variant="product" 
                    count={gridConfig.batchSize}
                    animate={gridConfig.enableAnimations}
                  />
                </div>
              ) : batchError ? (
                <div className="text-center py-4 text-red-600">
                  Error loading products batch
                </div>
              ) : (
                <div className={`grid grid-cols-${gridConfig.columns} gap-4`}>
                  {batchProducts?.map((product) => (
                    <OptimizedProductCard
                      key={product.id}
                      product={product}
                      onAction={handleProductAction}
                      enableAnimations={gridConfig.enableAnimations}
                    />
                  ))}
                </div>
              )}
            </EnhancedErrorBoundary>
          )}
        </SmartLazyLoader>
      ))}
    </div>
  )
}

// Optimized Product Card Component
interface OptimizedProductCardProps {
  product: Product
  onAction: (action: 'click' | 'cart' | 'wishlist' | 'share', product: Product) => void
  enableAnimations: boolean
}

function OptimizedProductCard({ 
  product, 
  onAction, 
  enableAnimations 
}: OptimizedProductCardProps) {
  const { getOptimizedImageUrl } = useNetworkAwareOptimization()
  
  const optimizedImageUrl = useMemo(() => {
    const imageUrl = product.images?.[0] || product.imageUrl || '/fallback-product.jpg'
    return getOptimizedImageUrl(imageUrl, 300, 300)
  }, [product.images, product.imageUrl, getOptimizedImageUrl])

  const cardClasses = useMemo(() => {
    const baseClasses = 'bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'
    const animationClasses = enableAnimations 
      ? 'hover:shadow-lg hover:scale-105 transition-all duration-300' 
      : 'hover:shadow-md'
    
    return `${baseClasses} ${animationClasses}`
  }, [enableAnimations])

  return (
    <EnhancedErrorBoundary
      fallback={
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-gray-600">Product unavailable</p>
        </div>
      }
    >
      <div className={cardClasses}>
        {/* Product Image */}
        <div 
          className="relative aspect-square cursor-pointer"
          onClick={() => onAction('click', product)}
        >
          <PerformanceOptimizedImage
            src={optimizedImageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAction('wishlist', product)
            }}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>

          {/* Product Badge */}
          {product.badge && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {product.badge}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>
          )}

          {/* Name */}
          <h3 
            className="font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => onAction('click', product)}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => onAction('cart', product)}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Add to Cart</span>
            </button>
            
            <button
              onClick={() => onAction('share', product)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </EnhancedErrorBoundary>
  )
}
