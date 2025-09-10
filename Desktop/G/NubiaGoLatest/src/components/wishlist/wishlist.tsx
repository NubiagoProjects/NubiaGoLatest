'use client'

import React, { useState } from 'react'
import { Heart, X, ShoppingCart, Star, Share2, Trash2, Eye, Move } from 'lucide-react'
import { ThumbnailImage } from '@/components/ui/enhanced-image'
import { Button } from '@/components/ui/button'

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  inStock: boolean
  addedAt: Date
  isWishlisted: boolean
}

interface WishlistProps {
  items: WishlistItem[]
  onRemoveFromWishlist: (itemId: string) => void
  onAddToCart: (item: WishlistItem) => void
  onViewProduct: (item: WishlistItem) => void
  onShareWishlist?: () => void
  onMoveToCart?: (itemId: string) => void
  className?: string
}

export default function Wishlist({
  items,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
  onShareWishlist,
  onMoveToCart,
  className = ''
}: WishlistProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))]

  // Sort and filter items
  const sortedAndFilteredItems = items
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.price - b.price
        case 'date':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      }
    })

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === sortedAndFilteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(sortedAndFilteredItems.map(item => item.id)))
    }
  }

  const handleBulkAddToCart = () => {
    const selectedWishlistItems = sortedAndFilteredItems.filter(item => selectedItems.has(item.id))
    selectedWishlistItems.forEach(item => onAddToCart(item))
    setSelectedItems(new Set())
  }

  const handleBulkRemove = () => {
    selectedItems.forEach(itemId => onRemoveFromWishlist(itemId))
    setSelectedItems(new Set())
  }

  if (items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Start adding products you love to your wishlist
          </p>
          <Button onClick={() => window.history.back()}>
            Start Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Wishlist Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            <h1 className="text-2xl font-bold text-gray-900">
              My Wishlist ({items.length} items)
            </h1>
          </div>
          {onShareWishlist && (
            <Button
              variant="outline"
              onClick={onShareWishlist}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Wishlist
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'price')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="date">Recently Added</option>
            <option value="name">Name A-Z</option>
            <option value="price">Price Low to High</option>
          </select>

          {/* Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">
                {selectedItems.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRemove}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="divide-y divide-gray-200">
        {sortedAndFilteredItems.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="mt-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />

              {/* Product Image */}
              <div className="flex-shrink-0">
                <ThumbnailImage
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.category}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-semibold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Added on {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Stock Status */}
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={() => onAddToCart(item)}
                    disabled={!item.inStock}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => onViewProduct(item)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>

                  {onMoveToCart && (
                    <Button
                      variant="outline"
                      onClick={() => onMoveToCart(item.id)}
                      disabled={!item.inStock}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Move className="h-4 w-4" />
                      Move to Cart
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => onRemoveFromWishlist(item.id)}
                    size="sm"
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {sortedAndFilteredItems.length === 0 && items.length > 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            No items match your current filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterCategory('all')
              setSortBy('date')
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.size === sortedAndFilteredItems.length && sortedAndFilteredItems.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Select All</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
