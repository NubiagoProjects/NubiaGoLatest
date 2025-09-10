'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart, Share2, Save, Eye, Star, Truck, Shield, CreditCard, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import Image from 'next/image'
import Link from 'next/link'
import Recommendations from './recommendations'

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
}

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onCheckout: () => void
  onSaveForLater?: (itemId: string) => void
  onMoveToCart?: (itemId: string) => void
  onAddToCart?: (item: RecommendedItem) => void
  onAddToWishlist?: (item: RecommendedItem) => void
  className?: string
}

const ShoppingCart = React.memo(function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onSaveForLater,
  onMoveToCart,
  onAddToCart,
  onAddToWishlist,
  className = ''
}: ShoppingCartProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [savedItems, setSavedItems] = useState<CartItem[]>([])

  const subtotal = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [items]
  )
  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  )
  const shipping = useMemo(() => 
    subtotal > 50 ? 0 : 5.99, 
    [subtotal]
  ) // Free shipping over $50
  const tax = useMemo(() => 
    subtotal * 0.08, 
    [subtotal]
  ) // 8% tax
  const total = useMemo(() => 
    subtotal + shipping + tax, 
    [subtotal, shipping, tax]
  )

  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    const item = items.find(i => i.id === itemId)
    if (item && item.maxQuantity && newQuantity > item.maxQuantity) return
    onUpdateQuantity(itemId, newQuantity)
  }, [items, onUpdateQuantity])

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 1
    const item = items.find(i => i.id === itemId)
    if (item) {
      const maxQuantity = item.maxQuantity || 99
      const validQuantity = Math.max(1, Math.min(quantity, maxQuantity))
      onUpdateQuantity(itemId, validQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    onRemoveItem(itemId)
  }

  const handleSaveForLater = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setSavedItems([...savedItems, item])
      onRemoveItem(itemId)
    }
  }

  const handleMoveToCart = (itemId: string) => {
    const item = savedItems.find(i => i.id === itemId)
    if (item) {
      setSavedItems(savedItems.filter(i => i.id !== itemId))
      // Add back to cart logic would go here
    }
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-4">
            Add some products to get started
          </p>
          <Button onClick={() => window.history.back()}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({totalItems} items)
            </h2>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {isCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Cart Items - Compact Amazon Style */}
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info - More Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{item.supplierName}</p>
                        
                        {/* Price and Savings */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <>
                              <span className="text-xs text-gray-500 line-through">
                                ${item.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-green-600 font-medium">
                                Save ${(item.originalPrice - item.price).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Stock Status */}
                        {!item.inStock && (
                          <span className="text-xs text-red-500 mt-1 inline-block">
                            Out of stock
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleSaveForLater(item.id)}
                          className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          Share
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls - Compact */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Qty:</span>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityInputChange(item.id, e.target.value)}
                            min="1"
                            max={item.maxQuantity || 99}
                            className="w-12 text-center text-xs border-0 focus:ring-0"
                            disabled={!item.inStock}
                          />
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save for Later Section */}
          {savedItems.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Save for later ({savedItems.length} items)</h3>
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.supplierName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleMoveToCart(item.id)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Move to cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart Summary - Amazon Style */}
          <div className="border-t border-gray-200 p-4">
            {/* Summary Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onCheckout}
                disabled={items.some(item => !item.inStock)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClearCart}
                  className="flex-1 text-sm"
                >
                  Clear Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1 text-sm"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            {subtotal < 50 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                  </p>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Secure checkout with SSL encryption</span>
            </div>
          </div>
        </>
      )}

      {/* Recommendations Section */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <Recommendations 
            cartItems={items}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
          />
        </div>
      )}
    </div>
  )
})

export default ShoppingCart 
