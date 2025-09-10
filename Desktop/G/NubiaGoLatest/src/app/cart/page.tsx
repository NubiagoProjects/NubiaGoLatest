'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, Shield, Truck, CreditCard, Star, Clock, Tag, AlertTriangle } from 'lucide-react'
import ShoppingCart from '@/components/cart/shopping-cart'
import { CartService } from '@/lib/services/cart.service'
import { useAuth } from '@/hooks/useAuth'
import { Product } from '@/types'
import { logger } from '@/lib/utils/logger'

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
  supplierId: string
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

export default function CartPage() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const { user } = useAuth()
  
  const cartService = useMemo(() => new CartService(), [])

  // Transform cart items to match ShoppingCart component interface
  const transformCartItems = useCallback((cart: any) => {
    return cart.items.map((item: any) => ({
      id: item.productId,
      name: item.product.name,
      price: item.price,
      originalPrice: item.product.originalPrice,
      quantity: item.quantity,
      image: item.product.images?.[0] || item.product.imageUrl || '',
      inStock: item.product.stock > 0,
      maxQuantity: item.product.stock,
      category: item.product.category,
      supplierId: 'supplier-1', // Default supplier ID
      supplierName: 'Supplier' // Default supplier name
    }))
  }, [])

  const fetchCart = useCallback(async () => {
    if (!user?.uid) {
      setCartItems([])
      setCartTotal(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const cart = await cartService.getCart(user.uid)
      const transformedItems = transformCartItems(cart)
      setCartItems(transformedItems)
      setCartTotal(cart.total)
    } catch (error: any) {
      setError(error)
      logger.error('Error fetching cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, cartService, transformCartItems])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!user?.uid) return
    
    try {
      const cart = await cartService.updateCartItemQuantity(user.uid, itemId, quantity)
      const transformedItems = transformCartItems(cart)
      setCartItems(transformedItems)
      setCartTotal(cart.total)
    } catch (error: any) {
      setError(error)
              logger.error('Error updating quantity:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!user?.uid) return
    
    try {
      const cart = await cartService.removeFromCart(user.uid, itemId)
      const transformedItems = transformCartItems(cart)
      setCartItems(transformedItems)
      setCartTotal(cart.total)
    } catch (error: any) {
      setError(error)
              logger.error('Error removing item:', error)
    }
  }

  const handleClearCart = async () => {
    if (!user?.uid) return
    
    try {
      const cart = await cartService.clearCart(user.uid)
      setCartItems([])
      setCartTotal(0)
    } catch (error: any) {
      setError(error)
              logger.error('Error clearing cart:', error)
    }
  }

  const handleCheckout = () => {
    window.location.href = '/checkout'
  }

  const handleAddToCart = async (item: RecommendedItem) => {
    if (!user?.uid) return
    
    try {
      // Convert recommended item to Product format
      const product: Product = {
        id: item.id,
        name: item.name,
        description: `High-quality ${item.name} with excellent features and durability.`,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        images: [item.image],
        category: item.category,
        rating: item.rating,
        reviewCount: item.reviewCount,
        inStock: true,
        sku: `SKU-${item.id}`,
        tags: [item.category, 'featured'],
        createdAt: new Date(),
        updatedAt: new Date(),
        featured: false,
        attributes: {}
      }
      
      const cart = await cartService.addToCart(user.uid, item.id, 1)
      const transformedItems = transformCartItems(cart)
      setCartItems(transformedItems)
      setCartTotal(cart.total)
    } catch (error: any) {
      setError(error)
              logger.error('Error adding to cart:', error)
    }
  }

  const handleAddToWishlist = (item: RecommendedItem) => {
    // This would typically add to wishlist store
            logger.log('Added to wishlist:', item.name)
    // You could implement wishlist functionality here
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-400 rounded-full animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Header */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-1">
                Shopping Cart
              </h1>
              <p className="text-lg text-gray-600">
                Review your items and proceed to secure checkout
              </p>
            </div>
            
            {/* Cart Stats - Compact */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-primary-600" />
                <span>{cartItems.length} Items</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators - Compact */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Secure Payment</div>
                <div className="text-xs text-gray-500">256-bit SSL encryption</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Free Shipping</div>
                <div className="text-xs text-gray-500">On orders over $50</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Easy Returns</div>
                <div className="text-xs text-gray-500">30-day return policy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Cart Content */}
          <div className="lg:col-span-2">
            <ShoppingCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>

          {/* Sidebar - Order Summary & Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-6 sticky top-6">
              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50 ? 'Free' : '$5.99'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50 ? 0 : 5.99) + (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.some(item => !item.inStock)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleClearCart}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <Link
                    href="/products"
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Shipping Progress */}
              {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) < 50 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Free Shipping Progress</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700">
                    Add ${(50 - cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)} more to get free shipping!
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
