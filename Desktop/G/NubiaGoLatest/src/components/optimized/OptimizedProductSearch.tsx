/**
 * Optimized Product Search
 * Enhanced search component with smart loading, error handling, and performance optimization
 */

'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react'
import { Product } from '@/types'
import { SmartLazyLoader } from '@/components/ui/smart-lazy-loader'
import { AdaptiveSkeleton } from '@/components/ui/adaptive-loading-skeleton'
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary'
import { useNetworkAwareOptimization } from '@/hooks/useNetworkAwareOptimization'
import { useLoadingStore } from '@/lib/services/unified-loading.service'
import { useDebounce } from '@/hooks/useDebounce'
import { OptimizedProductGrid } from './OptimizedProductGrid'

interface OptimizedProductSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => Promise<Product[]>
  onProductSelect?: (product: Product) => void
  placeholder?: string
  className?: string
  showFilters?: boolean
  initialQuery?: string
}

interface SearchFilters {
  category?: string
  priceRange?: [number, number]
  rating?: number
  inStock?: boolean
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

export function OptimizedProductSearch({
  onSearch,
  onProductSelect,
  placeholder = 'Search products...',
  className = '',
  showFilters = true,
  initialQuery = ''
}: OptimizedProductSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  
  const { getAdaptiveTimeout, shouldEnableFeature } = useNetworkAwareOptimization()
  const { startLoading, stopLoading } = useLoadingStore()
  const debouncedQuery = useDebounce(query, shouldEnableFeature('prefetch') ? 300 : 500)

  // Perform search with optimization
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const loadingId = `search-${Date.now()}`
    
    try {
      setIsSearching(true)
      setSearchError(null)
      startLoading(loadingId, 'Searching products')

      const timeout = getAdaptiveTimeout(5000)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), timeout)
      })

      const searchPromise = onSearch(searchQuery, searchFilters)
      const results = await Promise.race([searchPromise, timeoutPromise])
      
      setSearchResults(results)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      setSearchError(errorMessage)
      setSearchResults([])
    } finally {
      setIsSearching(false)
      stopLoading(loadingId)
    }
  }, [onSearch, getAdaptiveTimeout, startLoading, stopLoading])

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, filters)
    }
  }, [debouncedQuery, filters, performSearch])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setQuery('')
    setSearchResults([])
    setSearchError(null)
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const searchInputClasses = useMemo(() => {
    const baseClasses = 'w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    const animationClasses = shouldEnableFeature('animations') 
      ? 'transition-all duration-200' 
      : ''
    
    return `${baseClasses} ${animationClasses}`
  }, [shouldEnableFeature])

  return (
    <EnhancedErrorBoundary
      fallback={
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Search component failed to load</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      }
    >
      <div className={`space-y-4 ${className}`}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className={searchInputClasses}
            autoComplete="off"
          />
          
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {showFilters && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Filter Panel */}
        {showFilterPanel && (
          <SmartLazyLoader
            loadFunction={async () => ({ filters })}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            {() => (
              <SearchFilterPanel
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
            )}
          </SmartLazyLoader>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {isSearching && (
            <div className="space-y-4">
              <AdaptiveSkeleton 
                variant="text" 
                count={1} 
                className="h-6 w-48"
              />
              <AdaptiveSkeleton 
                variant="product" 
                count={6}
                animate={shouldEnableFeature('animations')}
              />
            </div>
          )}

          {searchError && (
            <EnhancedErrorBoundary
              fallback={
                <div className="text-center py-4">
                  <p className="text-red-600">Search error occurred</p>
                </div>
              }
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">Search failed: {searchError}</p>
                <button
                  onClick={() => performSearch(query, filters)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </EnhancedErrorBoundary>
          )}

          {!isSearching && !searchError && query && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {searchResults.length} results for "{query}"
                </p>
              </div>

              {searchResults.length > 0 ? (
                <OptimizedProductGrid
                  products={searchResults}
                  onProductClick={onProductSelect}
                  columns={2}
                  className="mt-4"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No products found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </EnhancedErrorBoundary>
  )
}

// Search Filter Panel Component
interface SearchFilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: Partial<SearchFilters>) => void
}

function SearchFilterPanel({ filters, onFiltersChange }: SearchFilterPanelProps) {
  const categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports', 'Books']
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ category: e.target.value || undefined })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange?.[0] || ''}
            onChange={(e) => {
              const min = e.target.value ? Number(e.target.value) : undefined
              const max = filters.priceRange?.[1]
              onFiltersChange({ 
                priceRange: min !== undefined || max !== undefined ? [min || 0, max || 1000] : undefined 
              })
            }}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange?.[1] || ''}
            onChange={(e) => {
              const max = e.target.value ? Number(e.target.value) : undefined
              const min = filters.priceRange?.[0]
              onFiltersChange({ 
                priceRange: min !== undefined || max !== undefined ? [min || 0, max || 1000] : undefined 
              })
            }}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <select
          value={filters.rating || ''}
          onChange={(e) => onFiltersChange({ rating: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy || 'relevance'}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
