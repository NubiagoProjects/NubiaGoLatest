'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, X, ChevronDown, ChevronUp, Star, Tag, Truck, Clock } from 'lucide-react'
import { useDebounce } from '@/lib/performance'
import { productService } from '@/lib/services/product.service'
import EnhancedImage from '@/components/mobile/EnhancedImage'

interface SearchFilters {
  query: string
  category: string[]
  brand: string[]
  priceRange: {
    min: number
    max: number
  }
  rating: number[]
  availability: string[]
  sortBy: string
  features: string[]
  location: string[]
  shipping: string[]
}

interface FilterOption {
  label: string
  value: string
  count: number
}

// Filter Section Component
const FilterSection = React.memo(function FilterSection({ 
  title, 
  options, 
  selected, 
  onChange 
}: {
  title: string
  options: FilterOption[]
  selected: string[]
  onChange: (value: string, checked: boolean) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        {title}
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isExpanded && (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={(e) => onChange(option.value, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              <span className="ml-auto text-xs text-gray-500">({option.count})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
})

// Product Card Component
const ProductCard = React.memo(function ProductCard({ product, viewMode }: { product: any, viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex space-x-4">
        <EnhancedImage
          src={product.imageUrl}
          alt={product.name}
          width={96}
          height={96}
          className="w-24 h-24 object-cover rounded-lg"
          sizes="96px"
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-lg font-semibold text-gray-900">₦{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">₦{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            {product.freeShipping && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                <Truck className="w-3 h-3 mr-1" />
                Free Shipping
              </span>
            )}
            {product.expressDelivery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                Express
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <EnhancedImage
        src={product.imageUrl}
        alt={product.name}
        width={400}
        height={192}
        className="w-full h-48 object-cover rounded-t-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-semibold text-gray-900">₦{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">₦{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {product.freeShipping && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <Truck className="w-3 h-3 mr-1" />
              Free Shipping
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

export const AdvancedSearch = React.memo(function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    brand: [],
    priceRange: { min: 0, max: 100000 },
    rating: [],
    availability: [],
    sortBy: 'relevance',
    features: [],
    location: [],
    shipping: []
  })

  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const debouncedQuery = useDebounce(filters.query, 500)

  // Filter options
  const categoryOptions: FilterOption[] = [
    { label: 'Electronics', value: 'electronics', count: 156 },
    { label: 'Fashion', value: 'fashion', count: 234 },
    { label: 'Home & Living', value: 'home-living', count: 89 },
    { label: 'Sports', value: 'sports', count: 67 },
    { label: 'Books', value: 'books', count: 123 },
    { label: 'Beauty', value: 'beauty', count: 78 }
  ]

  const brandOptions: FilterOption[] = [
    { label: 'Apple', value: 'apple', count: 23 },
    { label: 'Samsung', value: 'samsung', count: 18 },
    { label: 'Nike', value: 'nike', count: 45 },
    { label: 'Adidas', value: 'adidas', count: 32 },
    { label: 'Sony', value: 'sony', count: 15 },
    { label: 'LG', value: 'lg', count: 12 }
  ]

  const ratingOptions = [
    { label: '4+ Stars', value: '4', count: 234 },
    { label: '3+ Stars', value: '3', count: 456 },
    { label: '2+ Stars', value: '2', count: 678 }
  ]

  const availabilityOptions = [
    { label: 'In Stock', value: 'in-stock', count: 1234 },
    { label: 'Same Day Delivery', value: 'same-day', count: 234 },
    { label: 'Next Day Delivery', value: 'next-day', count: 567 }
  ]

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Rating', value: 'rating' },
    { label: 'Popularity', value: 'popularity' }
  ]

  const featureOptions = [
    { label: 'Free Shipping', value: 'free-shipping', count: 456 },
    { label: 'Express Delivery', value: 'express-delivery', count: 234 },
    { label: 'Cash on Delivery', value: 'cod', count: 789 },
    { label: 'Warranty', value: 'warranty', count: 345 },
    { label: 'Return Policy', value: 'return-policy', count: 567 }
  ]

  const locationOptions = [
    { label: 'Lagos', value: 'lagos', count: 1234 },
    { label: 'Abuja', value: 'abuja', count: 567 },
    { label: 'Port Harcourt', value: 'port-harcourt', count: 234 },
    { label: 'Kano', value: 'kano', count: 345 },
    { label: 'Ibadan', value: 'ibadan', count: 456 }
  ]

  // Search products (memoized)
  const searchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use the imported productService instance
      
      // Build search filters
      const searchFilters = {
        category: filters.category.length > 0 ? filters.category[0] : undefined,
        priceRange: filters.priceRange.min > 0 || filters.priceRange.max < 100000 ? filters.priceRange : undefined,
        rating: filters.rating.length > 0 ? Math.max(...filters.rating) : undefined
      }
      
      // Perform search
      const searchResults = await productService.searchProducts(filters.query, searchFilters)
      
      setResults(searchResults)
      setTotalResults(searchResults.length)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Search when filters change
  useEffect(() => {
    searchProducts()
  }, [debouncedQuery, filters.category, filters.brand, filters.priceRange, filters.rating, filters.availability, filters.sortBy, searchProducts])

  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1) // Reset to first page
  }

  const handleArrayFilterChange = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...(prev[filterType] as string[]), value]
        : (prev[filterType] as string[]).filter(item => item !== value)
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: [],
      brand: [],
      priceRange: { min: 0, max: 100000 },
      rating: [],
      availability: [],
      sortBy: 'relevance',
      features: [],
      location: [],
      shipping: []
    })
    setCurrentPage(1)
  }

  const getActiveFiltersCount = () => {
    return (
      filters.category.length +
      filters.brand.length +
      filters.rating.length +
      filters.availability.length +
      filters.features.length +
      filters.location.length +
      filters.shipping.length +
      (filters.priceRange.min > 0 || filters.priceRange.max < 100000 ? 1 : 0)
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for products, brands, and more..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.category.map(cat => (
              <span key={cat} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {categoryOptions.find(opt => opt.value === cat)?.label}
                <button
                  onClick={() => handleArrayFilterChange('category', cat, false)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.brand.map(brand => (
              <span key={brand} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {brandOptions.find(opt => opt.value === brand)?.label}
                <button
                  onClick={() => handleArrayFilterChange('brand', brand, false)}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex space-x-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>

            {/* Categories */}
            <FilterSection
              title="Categories"
              options={categoryOptions}
              selected={filters.category}
              onChange={(value, checked) => handleArrayFilterChange('category', value, checked)}
            />

            {/* Brands */}
            <FilterSection
              title="Brands"
              options={brandOptions}
              selected={filters.brand}
              onChange={(value, checked) => handleArrayFilterChange('brand', value, checked)}
            />

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Range: ₦{filters.priceRange.min.toLocaleString()} - ₦{filters.priceRange.max.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Rating */}
            <FilterSection
              title="Rating"
              options={ratingOptions}
              selected={filters.rating?.map(r => r.toString()) || []}
              onChange={(value, checked) => handleArrayFilterChange('rating', value, checked)}
            />

            {/* Availability */}
            <FilterSection
              title="Availability"
              options={availabilityOptions}
              selected={filters.availability}
              onChange={(value, checked) => handleArrayFilterChange('availability', value, checked)}
            />

            {/* Features */}
            <FilterSection
              title="Features"
              options={featureOptions}
              selected={filters.features}
              onChange={(value, checked) => handleArrayFilterChange('features', value, checked)}
            />

            {/* Location */}
            <FilterSection
              title="Location"
              options={locationOptions}
              selected={filters.location}
              onChange={(value, checked) => handleArrayFilterChange('location', value, checked)}
            />
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {isLoading ? 'Searching...' : `${totalResults.toLocaleString()} results`}
                </span>
                {filters.query && (
                  <span className="text-sm text-gray-600">
                    for "{filters.query}"
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {results.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && results.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {currentPage} of {Math.ceil(totalResults / 20)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalResults / 20)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
