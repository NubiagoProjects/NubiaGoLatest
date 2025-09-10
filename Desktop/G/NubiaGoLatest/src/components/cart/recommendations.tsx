'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Truck, Shield, Clock, Tag, Heart, Plus } from 'lucide-react'

interface RecommendedItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  isPrime?: boolean
  discount?: number
  description?: string
  tags?: string[]
}

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  inStock: boolean
  maxQuantity?: number
  category: string
  supplierName: string
}

interface RecommendationsProps {
  cartItems: CartItem[]
  onAddToCart?: (item: RecommendedItem) => void
  onAddToWishlist?: (item: RecommendedItem) => void
}

export default function Recommendations({ 
  cartItems, 
  onAddToCart, 
  onAddToWishlist 
}: RecommendationsProps) {
  
  // Intelligent recommendation algorithm based on cart contents
  const getRecommendations = (): RecommendedItem[] => {
    const recommendations: RecommendedItem[] = []
    const categories = [...new Set(cartItems.map(item => item.category))]
    
    // Generate recommendations based on cart items
    cartItems.forEach(item => {
      if (item.category === 'Electronics') {
        recommendations.push(
          {
            id: 'rec1',
            name: 'Wireless Bluetooth Headphones',
            price: 29.99,
            originalPrice: 49.99,
            image: '/product-recommendation-6.jpg',
            rating: 4.5,
            reviewCount: 1247,
            category: 'Electronics',
            isPrime: true,
            discount: 40,
            description: 'High-quality wireless headphones with noise cancellation',
            tags: ['Wireless', 'Noise Cancelling', 'Bluetooth 5.0']
          },
          {
            id: 'rec2',
            name: 'Phone Charger Cable Set',
            price: 12.99,
            originalPrice: 19.99,
            image: '/product-recommendation-1.jpg',
            rating: 4.3,
            reviewCount: 892,
            category: 'Electronics',
            isPrime: true,
            discount: 35,
            description: 'Fast charging cables for all devices',
            tags: ['Fast Charging', 'Universal', 'Durable']
          },
          {
            id: 'rec3',
            name: 'Phone Case with Stand',
            price: 15.99,
            originalPrice: 24.99,
            image: '/product-recommendation-2.jpg',
            rating: 4.2,
            reviewCount: 567,
            category: 'Electronics',
            isPrime: true,
            discount: 36,
            description: 'Protective case with built-in stand',
            tags: ['Protective', 'Stand', 'Slim']
          }
        )
      } else if (item.category === 'Fashion') {
        recommendations.push(
          {
            id: 'rec4',
            name: 'Casual Cotton T-Shirt',
            price: 15.99,
            originalPrice: 24.99,
            image: '/product-recommendation-3.jpg',
            rating: 4.2,
            reviewCount: 567,
            category: 'Fashion',
            isPrime: true,
            discount: 36,
            description: 'Comfortable cotton t-shirt for everyday wear',
            tags: ['Cotton', 'Comfortable', 'Casual']
          },
          {
            id: 'rec5',
            name: 'Denim Jeans',
            price: 45.99,
            originalPrice: 69.99,
            image: '/product-recommendation-3.jpg',
            rating: 4.4,
            reviewCount: 789,
            category: 'Fashion',
            isPrime: true,
            discount: 34,
            description: 'Classic denim jeans with perfect fit',
            tags: ['Denim', 'Classic', 'Comfortable']
          }
        )
      } else if (item.category === 'Home & Living') {
        recommendations.push(
          {
            id: 'rec6',
            name: 'Kitchen Utensil Set',
            price: 25.99,
            originalPrice: 39.99,
            image: '/product-recommendation-4.jpg',
            rating: 4.1,
            reviewCount: 456,
            category: 'Home & Living',
            isPrime: true,
            discount: 35,
            description: 'Complete kitchen utensil set for cooking',
            tags: ['Kitchen', 'Complete Set', 'Stainless Steel']
          }
        )
      }
    })
    
    // Add cross-category recommendations
    if (cartItems.length > 0) {
      recommendations.push(
        {
          id: 'rec7',
          name: 'Portable Power Bank',
          price: 19.99,
          originalPrice: 29.99,
                      image: '/product-recommendation-1.jpg',
            rating: 4.6,
            reviewCount: 1234,
          category: 'Electronics',
          isPrime: true,
          discount: 33,
          description: 'High-capacity portable charger for all devices',
          tags: ['Portable', 'High Capacity', 'Universal']
        },
        {
          id: 'rec8',
          name: 'Wireless Mouse',
          price: 22.99,
          originalPrice: 34.99,
                      image: '/product-recommendation-6.jpg',
            rating: 4.3,
            reviewCount: 678,
          category: 'Electronics',
          isPrime: true,
          discount: 34,
          description: 'Ergonomic wireless mouse for productivity',
          tags: ['Wireless', 'Ergonomic', 'Productivity']
        }
      )
    }
    
    return recommendations.slice(0, 6) // Limit to 6 recommendations
  }

  const recommendations = getRecommendations()

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Frequently bought together</h3>
          <p className="text-sm text-gray-500">Customers who bought items in your cart also bought</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Secure recommendations</span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.map((item) => (
          <div key={item.id} className="group relative">
            <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              {/* Image Container */}
              <div className="relative mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={150}
                  height={150}
                  className="w-full h-32 object-cover rounded"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.isPrime && (
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Prime
                    </div>
                  )}
                  {item.discount && (
                    <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                      -{item.discount}%
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onAddToWishlist?.(item)}
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {item.name}
                </h4>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(item.rating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({item.reviewCount})</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">${item.originalPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Add to Cart Button */}
                <button
                  onClick={() => onAddToCart?.(item)}
                  className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3" />
            <span>Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Fast delivery</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
