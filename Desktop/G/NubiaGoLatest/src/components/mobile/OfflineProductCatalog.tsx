'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  WifiIcon, 
  SignalSlashIcon, 
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import EnhancedImage from './EnhancedImage'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useCartStore } from '@/store/cart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
  isOffline?: boolean
}

interface OfflineProductCatalogProps {
  products?: Product[]
  onProductSelect?: (product: Product) => void
  className?: string
  showOfflineIndicator?: boolean
  enableOfflineMode?: boolean
  maxOfflineProducts?: number
}

export default function OfflineProductCatalog({
  products = [],
  onProductSelect,
  className = '',
  showOfflineIndicator = true,
  enableOfflineMode = true,
  maxOfflineProducts = 50
}: OfflineProductCatalogProps) {
  const [offlineProducts, setOfflineProducts] = useState<Product[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const { networkInfo, estimatedSpeed } = useNetworkStatus()
  const isOnline = networkInfo.online
  const { addItem } = useCartStore()

  // Check offline status and load cached products
  useEffect(() => {
    const checkOfflineStatus = async () => {
      setIsOffline(!isOnline)
      
      if (!isOnline && enableOfflineMode) {
        await loadOfflineProducts()
      }
    }

    checkOfflineStatus()
  }, [isOnline, enableOfflineMode])

  // Load products from offline storage
  const loadOfflineProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Try to get products from IndexedDB or localStorage
      const cachedProducts = await getCachedProducts()
      
      if (cachedProducts.length > 0) {
        setOfflineProducts(cachedProducts.slice(0, maxOfflineProducts))
      } else {
        // Fallback to provided products if no cache
        setOfflineProducts(products.slice(0, maxOfflineProducts).map(p => ({ ...p, isOffline: true })))
      }
    } catch (error) {
      console.error('Failed to load offline products:', error)
      // Use provided products as fallback
      setOfflineProducts(products.slice(0, maxOfflineProducts).map(p => ({ ...p, isOffline: true })))
    } finally {
      setIsLoading(false)
    }
  }, [products, maxOfflineProducts])

  // Get cached products from storage
  const getCachedProducts = async (): Promise<Product[]> => {
    try {
      if ('indexedDB' in window) {
        // Try IndexedDB first
        return await getFromIndexedDB()
      } else if ('localStorage' in window) {
        // Fallback to localStorage
        return await getFromLocalStorage()
      }
    } catch (error) {
      console.warn('Failed to get cached products:', error)
    }
    
    return []
  }

  // Get products from IndexedDB
  const getFromIndexedDB = async (): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NubiaGoProducts', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['products'], 'readonly')
        const store = transaction.objectStore('products')
        const getAllRequest = store.getAll()
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result || [])
        getAllRequest.onerror = () => reject(getAllRequest.error)
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' })
        }
      }
    })
  }

  // Get products from localStorage
  const getFromLocalStorage = async (): Promise<Product[]> => {
    try {
      const cached = localStorage.getItem('nubiago_products')
      return cached ? JSON.parse(cached) : []
    } catch (error) {
      console.warn('Failed to parse cached products from localStorage:', error)
      return []
    }
  }

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = isOffline ? offlineProducts : products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === 'price') {
        aValue = parseFloat(aValue.toString())
        bValue = parseFloat(bValue.toString())
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [isOffline, offlineProducts, products, searchQuery, selectedCategory, sortBy, sortOrder])

  // Get unique categories
  const categories = React.useMemo(() => {
    const allProducts = isOffline ? offlineProducts : products
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))]
    return ['all', ...uniqueCategories]
  }, [isOffline, offlineProducts, products])

  // Handle product selection
  const handleProductSelect = useCallback((product: Product) => {
    onProductSelect?.(product)
  }, [onProductSelect])

  // Handle add to cart
  const handleAddToCart = useCallback(async (product: Product) => {
    if (!product.inStock) return
    
    try {
      // Convert product to cart item format
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/images/placeholder-product.png',
        category: product.category,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock
      }
      
      addItem(cartItem)
    } catch (error) {
      console.error('Failed to add product to cart:', error)
    }
  }, [addItem])

  // Sync offline data when back online
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) return

    try {
      setIsLoading(true)
      // Here you would implement sync logic with your backend
      console.log('Syncing offline data...')
      
      // Clear offline flag after successful sync
      setOfflineProducts(prev => prev.map(p => ({ ...p, isOffline: false })))
    } catch (error) {
      console.error('Failed to sync offline data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isOnline])

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => handleProductSelect(product)}
    >
      {/* Product image */}
      <div className="relative aspect-square bg-gray-100">
        <EnhancedImage
          src={product.images[0] || '/fallback-product.jpg'}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Offline indicator */}
        {product.isOffline && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <CloudArrowDownIcon className="w-3 h-3" />
            <span>Offline</span>
          </div>
        )}
        
        {/* Stock indicator */}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart(product)
            }}
            disabled={!product.inStock}
            className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              !product.inStock
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {!product.inStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Offline status indicator */}
      {showOfflineIndicator && (
        <div className={`p-4 rounded-lg border ${
          isOffline 
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-center space-x-2">
            {isOffline ? (
              <>
                <SignalSlashIcon className="w-5 h-5" />
                <span className="font-medium">Offline Mode</span>
                <span className="text-sm opacity-75">
                  Browsing cached products • {offlineProducts.length} available
                </span>
              </>
            ) : (
              <>
                <WifiIcon className="w-5 h-5" />
                <span className="font-medium">Online Mode</span>
                <span className="text-sm opacity-75">
                  {networkInfo.quality} • {estimatedSpeed > 0 ? `${estimatedSpeed.toFixed(1)} Mbps` : 'Good connection'}
                </span>
              </>
            )}
          </div>
          
          {isOffline && (
            <button
              onClick={syncOfflineData}
              disabled={isLoading}
              className="mt-2 text-sm underline hover:no-underline disabled:opacity-50"
            >
              {isLoading ? 'Syncing...' : 'Sync when online'}
            </button>
          )}
        </div>
      )}

      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
          </select>

          {/* Sort order */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        {isOffline && ' (offline)'}
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : isOffline 
                ? 'No offline products available. Connect to the internet to browse products.'
                : 'No products available at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

// Hook for offline product management
export function useOfflineProducts() {
  const [offlineProducts, setOfflineProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const cacheProduct = useCallback(async (product: Product) => {
    try {
      // Cache to IndexedDB or localStorage
      if ('indexedDB' in window) {
        await cacheToIndexedDB(product)
      } else if ('localStorage' in window) {
        await cacheToLocalStorage(product)
      }
      
      setOfflineProducts(prev => [...prev, product])
    } catch (error) {
      console.error('Failed to cache product:', error)
    }
  }, [])

  const removeOfflineProduct = useCallback(async (productId: string) => {
    try {
      // Remove from storage
      if ('indexedDB' in window) {
        await removeFromIndexedDB(productId)
      } else if ('localStorage' in window) {
        await removeFromLocalStorage(productId)
      }
      
      setOfflineProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Failed to remove offline product:', error)
    }
  }, [])

  return {
    offlineProducts,
    isLoading,
    cacheProduct,
    removeOfflineProduct
  }
}

// Helper functions for storage operations
async function cacheToIndexedDB(product: Product): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NubiaGoProducts', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['products'], 'readwrite')
      const store = transaction.objectStore('products')
      const addRequest = store.put(product)
      
      addRequest.onsuccess = () => resolve()
      addRequest.onerror = () => reject(addRequest.error)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' })
      }
    }
  })
}

async function cacheToLocalStorage(product: Product): Promise<void> {
  try {
    const cached = localStorage.getItem('nubiago_products')
    const products = cached ? JSON.parse(cached) : []
    products.push(product)
    localStorage.setItem('nubiago_products', JSON.stringify(products))
  } catch (error) {
    throw new Error('Failed to cache to localStorage')
  }
}

async function removeFromIndexedDB(productId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NubiaGoProducts', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['products'], 'readwrite')
      const store = transaction.objectStore('products')
      const deleteRequest = store.delete(productId)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}

async function removeFromLocalStorage(productId: string): Promise<void> {
  try {
    const cached = localStorage.getItem('nubiago_products')
    const products = cached ? JSON.parse(cached) : []
    const filteredProducts = products.filter((p: Product) => p.id !== productId)
    localStorage.setItem('nubiago_products', JSON.stringify(filteredProducts))
  } catch (error) {
    throw new Error('Failed to remove from localStorage')
  }
}
