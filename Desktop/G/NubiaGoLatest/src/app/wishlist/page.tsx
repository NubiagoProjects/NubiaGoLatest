'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, ShoppingCart, Eye, Trash2, Gift, Sparkles } from 'lucide-react'
import Wishlist from '@/components/wishlist/wishlist'
import { WishlistService } from '@/lib/services/wishlist.service'
import { CartService } from '@/lib/services/cart.service'
import { productService } from '@/lib/services/product.service'
import { useAuth } from '@/hooks/useAuth'
import { Product } from '@/types'

export default function WishlistPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const { user } = useAuth()
  const wishlistService = new WishlistService()
  const cartService = new CartService()

  // Transform wishlist items to match component interface
  const transformWishlistItems = (wishlist: any) => {
    return wishlist.items.map((item: any) => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.price,
      originalPrice: item.product.originalPrice,
      image: item.product.imageUrl,
      category: item.product.category,
      inStock: item.product.stock > 0,
      addedAt: item.addedAt,
      isWishlisted: true
    }))
  }

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.uid) {
        setWishlistItems([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const wishlist = await wishlistService.getWishlist(user.uid)
        const transformedItems = transformWishlistItems(wishlist)
        setWishlistItems(transformedItems)
      } catch (error: any) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [user?.uid])

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!user?.uid) return
    
    try {
      const wishlist = await wishlistService.removeFromWishlist(user.uid, itemId)
      const transformedItems = transformWishlistItems(wishlist)
      setWishlistItems(transformedItems)
    } catch (error: any) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const handleAddToCart = async (item: any) => {
    if (!user?.uid) return
    
    try {
      await cartService.addToCart(user.uid, item.id, 1)
      // Optionally remove from wishlist after adding to cart
      await handleRemoveFromWishlist(item.id)
    } catch (error: any) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleViewProduct = (item: any) => {
    // Navigate to product detail page
    window.location.href = `/products/${item.id}`
  }

  const handleShareWishlist = async () => {
    if (!user?.uid) return
    
    try {
      const shareResult = await wishlistService.shareWishlist(user.uid)
      // You can implement sharing functionality here
      console.log('Share URL:', shareResult)
    } catch (error: any) {
      console.error('Error sharing wishlist:', error)
    }
  }

  const handleMoveToCart = async (itemId: string) => {
    if (!user?.uid) return
    
    try {
      const result = await wishlistService.moveToCart(user.uid, itemId, 1)
      const transformedItems = transformWishlistItems(result.wishlist)
      setWishlistItems(transformedItems)
    } catch (error: any) {
      console.error('Error moving to cart:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-400 rounded-full animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                My Wishlist
              </h1>
              <p className="text-xl text-gray-600">
                Curated collection of items you love
              </p>
            </div>
            
            {/* Wishlist Stats */}
            <div className="mt-6 lg:mt-0 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>{wishlistItems.length} Items</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <span>Saved for Later</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Action Bar */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-900">Your Collection</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">
                {wishlistItems.length} items saved
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200">
                <Share2 className="h-4 w-4 mr-2" />
                Share List
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all duration-200">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Move All to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Component */}
        <Wishlist
          items={wishlistItems}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          onViewProduct={handleViewProduct}
          onShareWishlist={handleShareWishlist}
          onMoveToCart={handleMoveToCart}
        />
      </div>
    </div>
  )
} 
