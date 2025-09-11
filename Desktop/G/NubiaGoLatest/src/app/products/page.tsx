"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Grid3X3, List, Filter, Search, ChevronDown } from 'lucide-react'
import { productService } from '@/lib/services/product.service'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { Product } from '@/types'
import { OptimizedProductGrid } from '@/components/optimized/OptimizedProductGrid'
import { OptimizedProductSearch } from '@/components/optimized/OptimizedProductSearch'
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary'
import { AdaptiveSkeleton } from '@/components/ui/adaptive-loading-skeleton'
import { useNetworkAwareOptimization } from '@/hooks/useNetworkAwareOptimization'

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty & Health',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games'
]

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'bestsellers', label: 'Best Sellers' },
  { id: 'new', label: 'New' },
  { id: 'toprated', label: 'Top Rated' },
  { id: 'price_low', label: 'Lowest Price' }
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedSort, setSelectedSort] = useState('recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { targetRef, isFetching, resetFetching } = useInfiniteScroll({
    enabled: hasMore && !isLoading
  })

  // Use the imported productService instance

  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    if (category) {
      setSelectedCategory(category)
    }
    loadProducts(category, subcategory)
  }, [searchParams])

  useEffect(() => {
    if (isFetching && hasMore) {
      const category = searchParams.get('category')
      const subcategory = searchParams.get('subcategory')
      loadProducts(category, subcategory, true)
    }
  }, [isFetching, hasMore, searchParams])

  const loadProducts = async (category?: string | null, subcategory?: string | null, isLoadingMore: boolean = false) => {
    try {
      if (!isLoadingMore) {
        setIsLoading(true)
        setPage(1)
      }

      let result: { products: Product[]; total: number; hasMore: boolean }
      const limit = 12
      const currentPage = isLoadingMore ? page : 1

      if (subcategory) {
        result = await productService.getProductsByCategory(subcategory, currentPage, limit)
      } else if (category) {
        result = await productService.getProductsByCategory(category, currentPage, limit)
      } else {
        result = await productService.getProducts(currentPage, limit)
      }

      if (isLoadingMore) {
        setProducts(prev => [...prev, ...result.products])
        setPage(prev => prev + 1)
      } else {
        setProducts(result.products)
      }

      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
      resetFetching()
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setShowCategoryDropdown(false)
    if (category === 'All Categories') {
      router.push('/products')
    } else {
      router.push(`/products?category=${category}`)
    }
  }

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId)
    console.log('Sort by:', sortId)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search for:', searchQuery)
  }

  const handleToggleWishlist = (product: Product) => {
    console.log('Toggle wishlist for product:', product.id)
  }

  const { shouldEnableFeature } = useNetworkAwareOptimization()

  // Enhanced search function for OptimizedProductSearch
  const handleProductSearch = useCallback(async (query: string, filters?: any) => {
    try {
      const result = await productService.searchProducts(query, filters)
      return result || []
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }, [])

  const handleProductSelect = useCallback((product: Product) => {
    router.push(`/products/${product.id}`)
  }, [router])

  const handleAddToCart = useCallback((product: Product) => {
    console.log('Add to cart:', product.id)
  }, [])

  const handleAddToWishlist = useCallback((product: Product) => {
    console.log('Add to wishlist:', product.id)
  }, [])

  const handleShare = useCallback((product: Product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: `/products/${product.id}`
      })
    }
  }, [])

  if (isLoading) {
    return (
      <EnhancedErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <AdaptiveSkeleton 
            variant="card" 
            count={6} 
            animate={shouldEnableFeature('animations')}
          />
        </div>
      </EnhancedErrorBoundary>
    )
  }

  return (
    <EnhancedErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors min-w-[180px] justify-between"
                  >
                    <span className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      {selectedCategory}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 first:rounded-t-md last:rounded-b-md"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortChange(option.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedSort === option.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Search Component */}
          <OptimizedProductSearch
            onSearch={handleProductSearch}
            onProductSelect={handleProductSelect}
            placeholder="Search products..."
            showFilters={true}
            initialQuery={searchQuery}
          />

          {/* Optimized Product Grid */}
          <OptimizedProductGrid
            products={products}
            loading={isLoading}
            onProductClick={handleProductSelect}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            onShare={handleShare}
            columns={viewMode === 'grid' ? 2 : 2}
            className="mt-6"
          />

          {products.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchParams.get('category') 
                    ? `We couldn't find any products in the "${searchParams.get('category')}" category.`
                    : 'We couldn\'t find any products matching your criteria.'
                  }
                </p>
                <Link 
                  href="/products" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View All Products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </EnhancedErrorBoundary>
  )
}
