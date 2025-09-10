'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingCart, Eye, Star } from 'lucide-react'
import { WishlistService } from '@/lib/services/wishlist.service'
import { CartService } from '@/lib/services/cart.service'
import { useAuth } from '@/hooks/useAuth'
import { Product } from '@/types'

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
    } catch (error) {
      console.error('Error moving to cart:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
            </div>
            <Link
              href="/products"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
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
                <div className="p-6">
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
                  <div className="flex space-x-2">
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
      </div>
    </div>
  )
} 
