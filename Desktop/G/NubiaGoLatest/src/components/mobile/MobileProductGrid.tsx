'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, Star, MessageCircle } from 'lucide-react'
import { Product } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/cart'
import { wishlistService } from '@/lib/services/wishlist.service'
import { imageOptimizer } from '@/lib/image-optimization'
import EnhancedImage from './EnhancedImage'

interface MobileProductGridProps {
  products: Product[]
  onToggleWishlist?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
}

export default function MobileProductGrid({ 
  products, 
  onToggleWishlist,
  onAddToCart,
  onQuickView 
}: MobileProductGridProps) {
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set())
  
  const { user } = useAuth()
  const { addItem } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleWishlist = async (product: Product) => {
    if (!user?.uid) {
      // Redirect to login or show login modal
      return
    }

    const productId = product.id
    setLoadingStates(prev => new Set(prev).add(productId))

    try {
      if (wishlistItems.has(productId)) {
        await wishlistService.removeFromWishlist(user.uid, productId)
        setWishlistItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      } else {
        await wishlistService.addToWishlist(user.uid, productId)
        setWishlistItems(prev => new Set(prev).add(productId))
      }

      onToggleWishlist?.(product)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setLoadingStates(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleAddToCart = async (product: Product) => {
    if (!user?.uid) {
      // Redirect to login or show login modal
      return
    }

    const productId = product.id
    setLoadingStates(prev => new Set(prev).add(productId))

    try {
      addItem(product, 1)

      onAddToCart?.(product)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setLoadingStates(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleQuickView = (product: Product) => {
    onQuickView?.(product)
  }

  const handleWhatsAppShare = (product: Product) => {
    const message = `Check out this product: ${product.name} - $${product.price}\n\n${window.location.origin}/products/${product.id}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-product-grid">
      {products.map((product) => {
        const isInWishlist = wishlistItems.has(product.id)
        const isLoading = loadingStates.has(product.id)
        const optimizedImage = imageOptimizer.optimizeImage(product.images?.[0] || '/placeholder-image.jpg', {
          width: 400,
          height: 400,
          quality: 75,
          format: 'auto',
          networkSpeed: 'medium',
          priority: false
        })

        return (
          <div key={product.id} className="mobile-product-card">
            {/* Product Image */}
            <div className="relative group">
              <Link href={`/products/${product.id}`}>
                <EnhancedImage
                  src={optimizedImage.src}
                  alt={product.name}
                  className="mobile-product-image"
                  width={400}
                  height={400}
                  priority={false}
                />
              </Link>
              
              {/* Quick Actions Overlay */}
              <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleWishlist(product)}
                  disabled={isLoading}
                  className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  <Heart 
                    className={`h-5 w-5 ${
                      isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'
                    }`} 
                  />
                </button>
                
                <button
                  onClick={() => handleQuickView(product)}
                  className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  <Eye className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Rating Badge */}
              {product.rating && product.rating > 0 && (
                <div className="absolute bottom-2 left-2 bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-sm">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium text-gray-700">
                    {product.rating?.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              {/* Product Name */}
              <Link href={`/products/${product.id}`}>
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-sm text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isLoading}
                  className="mobile-touch-target flex-1 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
                
                <button
                  onClick={() => handleWhatsAppShare(product)}
                  className="mobile-touch-target bg-green-500 text-white rounded-lg p-3 hover:bg-green-600 transition-colors"
                  title="Share via WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
