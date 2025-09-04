import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'

export interface ProductCardProps {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  badge?: 'New' | 'Hot' | 'Sale' | 'Featured'
  rating?: number
  reviewCount?: number
  category?: string
  isWishlisted?: boolean
  onAddToWishlist?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  className?: string
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
  onAddToWishlist,
  onAddToCart,
  className = ''
}) => {
  const handleWishlistToggle = () => {
    onAddToWishlist?.(id)
  }

  const handleAddToCart = () => {
    onAddToCart?.(id)
  }

  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${className}`}>
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
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-600">{price}</span>
          {originalPrice && (
            <span className="text-sm text-neutral-500 line-through">{originalPrice}</span>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500 ml-1">({reviewCount})</span>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          variant="primary"
          size="sm"
          className="w-full mt-auto hover:bg-primary-700 transition-colors"
          leftIcon={<ShoppingCart className="h-4 w-4" />}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
