'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, TrendingUp, Clock, Star } from 'lucide-react'
import { Product } from '@/types'
import { productService } from '@/lib/services/product.service'
import { useDebounce } from '@/hooks/useDebounce'
import { imageOptimizer } from '@/lib/image-optimization'
import EnhancedImage from './EnhancedImage'

interface MobileSearchProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  onProductSelect?: (product: Product) => void
}

interface SearchResult {
  product: Product
  relevance: number
  matchType: 'exact' | 'partial' | 'category' | 'tag'
}

export default function MobileSearch({
  isOpen,
  onClose,
  onSearch,
  onProductSelect
}: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  // Use the imported productService instance
  
  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Load recent and trending searches
  useEffect(() => {
    loadRecentSearches()
    loadTrendingSearches()
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Perform search when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery)
    } else if (debouncedQuery.trim().length === 0) {
      setSearchResults([])
      setHasSearched(false)
    }
  }, [debouncedQuery])

  const loadRecentSearches = () => {
    try {
      const recent = localStorage.getItem('recentSearches')
      if (recent) {
        setRecentSearches(JSON.parse(recent))
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }

  const loadTrendingSearches = () => {
    // Mock trending searches - in real app, this would come from analytics
    setTrendingSearches([
      'smartphone',
      'laptop',
      'shoes',
      'dress',
      'headphones',
      'watch',
      'bag',
      'perfume'
    ])
  }

  const saveRecentSearch = (query: string) => {
    try {
      const recent = localStorage.getItem('recentSearches') || '[]'
      const recentList = JSON.parse(recent)
      const newRecent = [query, ...recentList.filter((q: string) => q !== query)]
      localStorage.setItem('recentSearches', JSON.stringify(newRecent.slice(0, 10)))
      setRecentSearches(newRecent.slice(0, 10))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      // Search products using ProductService
      const products = await productService.searchProducts(query)
      
      // Process and rank results
      const results: SearchResult[] = products.map((product: Product) => {
        let relevance = 0
        let matchType: SearchResult['matchType'] = 'tag'

        // Exact name match
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          relevance += 100
          matchType = 'exact'
        }
        
        // Partial name match
        if (product.name.toLowerCase().includes(query.toLowerCase().split(' ')[0])) {
          relevance += 50
          matchType = 'partial'
        }

        // Category match
        if (product.category.toLowerCase().includes(query.toLowerCase())) {
          relevance += 30
          matchType = 'category'
        }

        // Tag match
        if (product.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))) {
          relevance += 20
        }

        // Rating boost
        if (product.rating && product.rating > 4) relevance += 10

        return { product, relevance, matchType }
      })

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance)
      setSearchResults(results)

    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveRecentSearch(query)
      onSearch(query)
      onClose()
    }
  }

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product)
    onClose()
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  const handleTrendingSearchClick = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Search Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched && searchQuery.length < 2 ? (
          /* Default State - Recent & Trending */
          <div className="p-4 space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingSearchClick(query)}
                    className="px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {searchResults.length} results for "{searchQuery}"
                </h3>
                
                {searchResults.map((result) => (
                  <div
                    key={result.product.id}
                    onClick={() => handleProductSelect(result.product)}
                    className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <EnhancedImage
                        src={imageOptimizer.optimizeImage(result.product.images?.[0] || '/placeholder-image.jpg', {
                          width: 60,
                          height: 60,
                          quality: 75,
                          format: 'auto',
                          networkSpeed: 'medium',
                          priority: false
                        }).src}
                        alt={result.product.name}
                        className="w-15 h-15 object-cover rounded-lg"
                        width={60}
                        height={60}
                        priority={false}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {result.product.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {result.product.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {result.product.rating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary-600">
                          ${result.product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Match Type Indicator */}
                    <div className="flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.matchType === 'exact' ? 'bg-green-100 text-green-800' :
                        result.matchType === 'partial' ? 'bg-blue-100 text-blue-800' :
                        result.matchType === 'category' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.matchType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse our categories
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
