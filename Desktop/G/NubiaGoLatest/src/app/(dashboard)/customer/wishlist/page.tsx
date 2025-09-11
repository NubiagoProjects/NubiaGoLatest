'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingCart, Eye, Star, Grid, List, Filter } from 'lucide-react'
import { WishlistService } from '@/lib/services/wishlist.service'
import { CartService } from '@/lib/services/cart.service'
import { useAuth } from '@/hooks/useAuth'
import { Product } from '@/types'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import { AIRecommendations } from '@/components/product/ai-recommendations'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    images: string[]
    rating: number
    reviewCount: number
    stock: number
  }
  addedAt: Date
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const { user } = useAuth()
  
  const wishlistService = useMemo(() => new WishlistService(), [])
  const cartService = useMemo(() => new CartService(), [])

  const loadWishlist = useCallback(async () => {
    if (!user?.uid) {
      setWishlistItems([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const wishlist = await wishlistService.getWishlist(user.uid)
      
      // Transform wishlist items to match the interface
      const transformedItems: WishlistItem[] = wishlist.items.map((item: any) => ({
        id: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          images: item.product.images,
          rating: item.product.rating,
          reviewCount: item.product.reviewCount,
          stock: item.product.stock
        },
        addedAt: item.addedAt
      }))
      
      setWishlistItems(transformedItems)
    } catch (error) {
      console.error('Error loading wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, wishlistService])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const removeFromWishlist = async (itemId: string) => {
    if (!user?.uid) return
    
    try {
      await wishlistService.removeFromWishlist(user.uid, itemId)
      setWishlistItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const moveToCart = async (item: WishlistItem) => {
    if (!user?.uid) return
    
    try {
      // Move item from wishlist to cart
      await wishlistService.moveToCart(user.uid, item.id, 1)
      // Remove from local state
      setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id))
      console.log('Item moved to cart successfully')
    } catch (error) {
      console.error('Error moving to cart:', error)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/customer' },
    { label: 'Wishlist', href: '/customer/wishlist' }
  ]

  const handleContinueShopping = () => {
    window.location.href = '/products'
  }

  const sortedItems = useMemo(() => {
    const items = [...wishlistItems]
    switch (sortBy) {
      case 'name':
        return items.sort((a, b) => a.product.name.localeCompare(b.product.name))
      case 'price-low':
        return items.sort((a, b) => a.product.price - b.product.price)
      case 'price-high':
        return items.sort((a, b) => b.product.price - a.product.price)
      case 'recent':
      default:
        return items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    }
  }, [wishlistItems, sortBy])

  if (isLoading) {
    return (
      <ModernSubpageLayout
        title="My Wishlist"
        breadcrumbs={breadcrumbs}
        showAddButton={true}
        addButtonText="Continue Shopping"
        onAddClick={handleContinueShopping}
      >
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </ModernSubpageLayout>
    )
  }

  return (
    <ModernSubpageLayout
      title="My Wishlist"
      subtitle={`${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} in your wishlist`}
      breadcrumbs={breadcrumbs}
      showAddButton={true}
      addButtonText="Continue Shopping"
      onAddClick={handleContinueShopping}
    >
      {/* Stats and Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{wishlistItems.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${sortedItems.reduce((sum, item) => sum + item.product.price, 0).toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Start adding items to your wishlist to save them for later.
          </p>
          <Link
            href="/products"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedItems.map((item) => (
              <div key={item.id} className={`bg-white rounded-lg shadow-lg overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
                {/* Product Image */}
                <div className={`relative bg-gray-100 ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  {item.product.originalPrice && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= item.product.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      ({item.product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${item.product.price.toFixed(2)}
                    </span>
                    {item.product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">
                        ${item.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    {item.product.stock > 0 ? (
                      <span className="text-green-600 text-sm font-medium">
                        In Stock ({item.product.stock} available)
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex space-x-2 ${viewMode === 'list' ? 'mt-4' : ''}`}>
                    <button
                      onClick={() => moveToCart(item)}
                      disabled={item.product.stock === 0}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Added Date */}
                  <div className="mt-4 text-xs text-gray-500">
                    Added {item.addedAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Wishlist-based AI Recommendations */}
      {wishlistItems.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You Might Also Like
              </h2>
              <p className="text-gray-600">
                Based on your wishlist preferences, here are some products you might enjoy
              </p>
            </div>
            
            <AIRecommendations
              context={{
                userId: user?.uid,
                category: wishlistItems.length > 0 ? wishlistItems[0].product.name.split(' ')[0] : undefined
              }}
              limit={6}
              title=""
              className="bg-transparent"
            />
          </div>
        </div>
      )}
    </ModernSubpageLayout>
  )
} 
