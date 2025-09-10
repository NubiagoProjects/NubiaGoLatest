'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { productService } from '@/lib/services/product.service'
import MobileHeader from './MobileHeader'
import MobileProductGrid from './MobileProductGrid'
import CategoryPills from './CategoryPills'
import MobileMenu from './MobileMenu'
import { imageOptimizer } from '@/lib/image-optimization'
import EnhancedImage from './EnhancedImage'

interface MobileHomepageProps {
  onSearch: (query: string) => void
  onCategorySelect: (category: string) => void
}

export default function MobileHomepage({
  onSearch,
  onCategorySelect
}: MobileHomepageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  // Use the imported productService instance

  useEffect(() => {
    loadProducts()
    loadRecentlyViewed()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const featuredProductsPromise = productService.getFeaturedProducts(12)
      
      const featuredProducts = await Promise.race([featuredProductsPromise, timeoutPromise]) as Product[]
      setProducts(featuredProducts)
    } catch (error) {
      console.error('Error loading products:', error)
      // Set empty products array to prevent infinite loading
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentlyViewed = () => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const recent = localStorage.getItem('recentlyViewedProducts')
        if (recent) {
          const recentIds = JSON.parse(recent)
          if (recentIds.length > 0) {
            // Load recently viewed products
            const loadRecent = async () => {
              try {
                const recentProducts = await Promise.all(
                  recentIds.slice(0, 6).map((id: string) => productService.getProduct(id))
                )
                setRecentlyViewed(recentProducts.filter(Boolean))
              } catch (error) {
                console.error('Error loading recently viewed products:', error)
              }
            }
            loadRecent()
          }
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error)
    }
  }

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
    onCategorySelect(category)
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSearch = (query: string) => {
    onSearch(query)
  }

  const handleProductClick = (product: Product) => {
    // Save to recently viewed
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const recent = localStorage.getItem('recentlyViewedProducts') || '[]'
        const recentIds = JSON.parse(recent)
        const newRecent = [product.id, ...recentIds.filter((id: string) => id !== product.id)]
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(newRecent.slice(0, 10)))
      }
    } catch (error) {
      console.error('Error saving recently viewed product:', error)
    }
  }

  return (
    <div className="mobile-homepage md:hidden min-h-screen-safe bg-gray-50">
      {/* Mobile Header */}
      <header className="mobile-header bg-white shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NubiaGo</h1>
              <p className="text-sm text-gray-600">Your Shopping Partner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Welcome to NubiaGo
            </h1>
            <p className="text-primary-100 mb-4">
              Discover amazing products at unbeatable prices
            </p>
            <button
              onClick={() => onCategorySelect('all')}
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </button>
          </div>
        </section>

        {/* Category Pills */}
        <section className="py-4 bg-white">
          <CategoryPills
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </section>

        {/* Featured Products */}
        <section className="py-6">
          <div className="px-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 text-sm">Handpicked items just for you</p>
          </div>
          
          {isLoading ? (
            <div className="px-4">
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MobileProductGrid
              products={products}
              onQuickView={handleProductClick}
            />
          )}
        </section>

        {/* Popular Categories */}
        <section className="py-6 bg-white">
          <div className="px-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Popular Categories</h2>
            <p className="text-gray-600 text-sm">Explore our top categories</p>
          </div>
          
          <div className="px-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Electronics', icon: '📱', count: '2.5k+', color: 'bg-blue-100' },
                { name: 'Fashion', icon: '👗', count: '1.8k+', color: 'bg-pink-100' },
                { name: 'Home & Living', icon: '🏠', count: '1.2k+', color: 'bg-green-100' },
                { name: 'Beauty', icon: '💄', count: '900+', color: 'bg-purple-100' }
              ].map((category, index) => (
                <div
                  key={index}
                  onClick={() => onCategorySelect(category.name.toLowerCase().replace(/\s+/g, '-'))}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                    {category.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} products</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="py-6">
            <div className="px-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-gray-600 text-sm">Continue shopping where you left off</p>
            </div>
            
            <div className="px-4">
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                {recentlyViewed.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="flex-shrink-0 w-32 bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <EnhancedImage
                      src={imageOptimizer.optimizeImage(product.images?.[0] || '/placeholder-product.jpg', {
                        width: 120,
                        height: 120,
                        quality: 75,
                        format: 'auto',
                        networkSpeed: 'medium',
                        priority: false
                      }).src}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      width={120}
                      height={120}
                      priority={false}
                    />
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-primary-600 font-bold text-sm">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Special Offers */}
        <section className="py-6 bg-gradient-to-r from-yellow-400 to-orange-400">
          <div className="px-4 text-center text-white">
            <h2 className="text-xl font-bold mb-2">Special Offers</h2>
            <p className="mb-4">Get up to 50% off on selected items</p>
            <button
              onClick={() => onCategorySelect('all')}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Offers
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
