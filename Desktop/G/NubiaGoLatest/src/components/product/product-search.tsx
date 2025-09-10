'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, SortAsc, SortDesc, Star, ShoppingCart, Heart, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { useAuth } from '@/hooks/useAuth'
import { useSearchHistoryStore } from '@/store/search-history'
import { SearchSuggestions } from './search-suggestions'
import { Product } from '@/types'
import Image from 'next/image'

interface ProductSearchProps {
  products: Product[]
  onAddToCart?: (product: Product) => void
  onToggleWishlist?: (product: Product) => void
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest'

const ProductSearch = React.memo(function ProductSearch({ 
  products, 
  onToggleWishlist 
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { addToHistory } = useSearchHistoryStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())
  
  // Initialize services and auth
  const { user } = useAuth()
  const cartService = new CartService()
  const wishlistService = new WishlistService()

  // Fetch user's wishlist items
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!user?.uid) {
        setWishlistItems(new Set())
        return
      }

      try {
        const wishlist = await wishlistService.getWishlist(user.uid)
        const itemIds = new Set<string>(wishlist.items.map((item: { productId: string }) => item.productId))
        setWishlistItems(itemIds)
      } catch (error) {
        console.error('Error fetching wishlist items:', error)
      }
    }

    fetchWishlistItems()
  }, [user?.uid, wishlistService])

  // Get unique categories (memoized)
  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(products.map(p => p.category)))], 
    [products]
  )

  // Filter and sort products (memoized)
  const filteredProducts = useMemo(() => products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesRating = product.rating ? product.rating >= minRating : minRating === 0
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'newest':
        default:
          return 0 // Assuming products are already sorted by newest
      }
    }), [products, searchQuery, selectedCategory, priceRange, minRating, sortBy])

  const handleAddToCart = useCallback(async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    
    if (!user?.uid) {
      alert('Please sign in to add items to cart')
      return
    }
    
    try {
      await cartService.addToCart(user.uid, product.id, 1)
      alert(`${product.name} has been added to your cart`)
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart')
    }
  }, [user?.uid, cartService])

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    
    if (!user?.uid) {
      alert('Please sign in to manage wishlist')
      return
    }
    
    try {
      const isInWishlist = wishlistItems.has(product.id)
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(user.uid, product.id)
        setWishlistItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
        alert(`${product.name} has been removed from your wishlist`)
      } else {
        await wishlistService.addToWishlist(user.uid, product.id)
        setWishlistItems(prev => new Set([...prev, product.id]))
        alert(`${product.name} has been added to your wishlist`)
      }
      
      onToggleWishlist?.(product)
    } catch (error: any) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist')
    }
  }, [user?.uid, wishlistItems, wishlistService, onToggleWishlist])

  return (
    <div className="w-full">
      {/* Search and Filter Header */}
      <div className="mb-6">
        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
            <option value="rating-desc">Highest Rated</option>
          </select>

          <span className="text-sm text-gray-600">
            {filteredProducts.length} products found
          </span>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setPriceRange([0, 1000])
                    setMinRating(0)
                  }}
                  className="w-full"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group block overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.images?.[0] || '/placeholder-image.jpg'}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                priority={false}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
              <button
                onClick={(e) => handleToggleWishlist(e, product)}
                className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Heart 
                  className={`px-3 py-1 text-xs rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} 
                />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-3 flex flex-col h-full">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600">
                    {product.rating?.toFixed(1) || '0.0'}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviewCount})</span>
                </div>
                <span className="text-xs text-gray-500">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto">
                <Button
                  onClick={(e: React.MouseEvent) => handleAddToCart(e, product)}
                  disabled={!product.inStock}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Search className="h-8 w-8 mx-auto" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-sm">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  )
})

export default ProductSearch 
