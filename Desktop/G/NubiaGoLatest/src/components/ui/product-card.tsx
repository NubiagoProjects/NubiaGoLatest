import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ShoppingCart, Check } from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

export interface ProductCardProps {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  badge?: 'New' | 'Hot' | 'Sale' | 'Featured' | 'Out of Stock'
  rating?: number
  reviewCount?: number
  category?: string
  isWishlisted?: boolean
  inStock?: boolean
  onAddToWishlist?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  className?: string
}

// Simplified Product interface that matches our needs
interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  rating?: number
  reviewCount?: number
  inStock?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  badge,
  rating = 4.5,
  reviewCount = 0,
  category,
  isWishlisted = false,
  inStock = true,
  onAddToWishlist,
  onAddToCart,
  className = ''
}) => {
  const handleWishlistToggle = () => {
    onAddToWishlist?.(id)
  }

  const { addItem, items } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  const isInCart = items.some(item => item.productId === id)
  const isOutOfStock = inStock === false

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock) return;
    
    if (isInCart) {
      window.location.href = '/cart'
      return
    }

    setIsAdding(true)
    try {
      // Simulate API call or any async operation
      await new Promise(resolve => setTimeout(resolve, 500))
      const product: Product = {
        id,
        name,
        price: parseFloat(price.replace(/[^0-9.-]+/g, '')),
        originalPrice: originalPrice ? parseFloat(originalPrice.replace(/[^0-9.-]+/g, '')) : undefined,
        image,
        category: category ?? 'Uncategorized',
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        inStock: !isOutOfStock
      }
      addItem(product)
      onAddToCart?.(id)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${isOutOfStock ? 'opacity-70' : ''} ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${id}`}>
          <Image
            src={image}
            alt={name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
        </Link>
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant={badge === 'New' ? 'primary' : badge === 'Sale' ? 'warning' : 'yellow'} 
              size="sm"
            >
              {badge}
            </Badge>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlistToggle}
            className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors touch-manipulation"
          >
            <Heart 
              className={`h-5 w-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-neutral-600'}`} 
            />
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex flex-col h-full">
        {/* Category */}
        {category && (
          <div className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">{category}</div>
        )}
        
        {/* Product Name */}
        <Link href={`/products/${id}`} className="block flex-grow">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-tight mb-3 hover:text-primary-600 transition-colors">
            {name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900">{price}</span>
            {originalPrice && (
              <span className="text-sm text-neutral-400 line-through">{originalPrice}</span>
            )}
          </div>
          {rating > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {reviewCount > 0 && (
                <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <Button
          size="sm"
          variant={isInCart ? 'default' : isOutOfStock ? 'ghost' : 'outline'}
          className={cn(
            'w-full mt-3 transition-all duration-200',
            isInCart 
              ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
              : isOutOfStock
                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'border-neutral-200 hover:bg-neutral-50 hover:border-primary-300 hover:text-primary-600',
            isAdding && 'opacity-75 cursor-not-allowed'
          )}
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
        >
          {isAdding ? (
            <>
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
              Adding...
            </>
          ) : isInCart ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              View Cart
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
