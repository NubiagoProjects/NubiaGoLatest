'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Share2, Clock, User } from 'lucide-react'
import { wishlistService } from '@/lib/services/wishlist.service'
import { Wishlist, WishlistItem } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function SharedWishlistPage() {
  const params = useParams()
  const shareCode = params.shareCode as string
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSharedWishlist = async () => {
      try {
        setLoading(true)
        const sharedWishlist = await wishlistService.getSharedWishlist(shareCode)
        if (sharedWishlist) {
          setWishlist(sharedWishlist)
        } else {
          setError('Wishlist not found or has expired')
        }
      } catch (err) {
        setError('Failed to load shared wishlist')
        console.error('Error loading shared wishlist:', err)
      } finally {
        setLoading(false)
      }
    }

    if (shareCode) {
      loadSharedWishlist()
    }
  }, [shareCode])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this wishlist!',
          text: `Someone shared their wishlist with you - ${wishlist?.items.length} amazing products!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared wishlist...</p>
        </div>
      </div>
    )
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'This wishlist may have expired or the link is invalid.'}
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalValue = wishlist.items.reduce((sum, item) => sum + (item.product?.price || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shared Wishlist</h1>
                <p className="text-gray-600">
                  {wishlist.items.length} items • Total value: {formatPrice(totalValue)}
                </p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlist.items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Empty Wishlist</h2>
            <p className="text-gray-600">This wishlist doesn't have any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.items.map((item: WishlistItem, index: number) => (
              <div key={item.product?.id || index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.product?.images?.[0] || '/fallback-product.jpg'}
                    alt={item.product?.name || 'Product'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.product?.name}
                  </h3>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(item.product?.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({item.product?.reviewCount || 0})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(item.product?.price || 0)}
                      </span>
                      {item.product?.originalPrice && item.product.originalPrice > item.product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Link
                      href={`/products/${item.product?.id}`}
                      className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      View Product
                    </Link>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <ShoppingCart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Want to create your own wishlist?
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
