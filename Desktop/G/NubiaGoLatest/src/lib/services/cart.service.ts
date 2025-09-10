import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Cart, CartItem } from '@/types'
import { Product } from '@/types/product'
import { productService } from './product.service'

export class CartService {
  private readonly COLLECTION_NAME = 'carts'

  // Get user's cart
  async getCart(userId: string): Promise<Cart> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId)
      const cartDoc = await getDoc(cartRef)

      if (!cartDoc.exists()) {
        // Create empty cart if it doesn't exist
        const emptyCart: Cart = {
          id: userId,
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          updatedAt: new Date()
        }
        await setDoc(cartRef, emptyCart)
        return emptyCart
      }

      const cartData = cartDoc.data() as Cart
      
      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        cartData.items.map(async (item) => {
          const product = await productService.getProduct(item.productId)
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: 'Product not found',
              description: 'Product not available',
              price: item.price,
              image: '',
              images: [],
              category: '',
              sku: '',
              inStock: false,
              rating: 0,
              reviewCount: 0,
              tags: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        })
      )

      return {
        ...cartData,
        items: itemsWithProducts
      }
    } catch (error) {
      console.error('Error getting cart:', error)
      throw new Error('Failed to fetch cart')
    }
  }

  // Add item to cart
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<Cart> {
    try {
      const product = await productService.getProduct(productId)
      if (!product) {
        throw new Error('Product not found')
      }

      if (product.inStock === false) {
        throw new Error('Product out of stock')
      }

      const cart = await this.getCart(userId)
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId)

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${productId}_${Date.now()}`,
          productId,
          quantity,
          price: product.price,
          product,
          addedAt: new Date()
        }
        cart.items.push(newItem)
      }

      // Update cart totals
      this.updateCartTotals(cart)

      // Save to Firestore
      const cartRef = doc(db, this.COLLECTION_NAME, userId)
      await setDoc(cartRef, cart)

      return cart
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw new Error('Failed to add item to cart')
    }
  }

  // Update cart item quantity
  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      const itemIndex = cart.items.findIndex(item => item.productId === productId)

      if (itemIndex === -1) {
        throw new Error('Item not found in cart')
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1)
      } else {
        // Check stock availability
        const product = await productService.getProduct(productId)
        if (product && product.inStock === false) {
          throw new Error('Product out of stock')
        }
        cart.items[itemIndex].quantity = quantity
      }

      // Update cart totals
      this.updateCartTotals(cart)

      // Save to Firestore
      const cartRef = doc(db, this.COLLECTION_NAME, userId)
      await setDoc(cartRef, cart)

      return cart
    } catch (error) {
      console.error('Error updating cart item:', error)
      throw new Error('Failed to update cart item')
    }
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      cart.items = cart.items.filter(item => item.productId !== productId)

      // Update cart totals
      this.updateCartTotals(cart)

      // Save to Firestore
      const cartRef = doc(db, this.COLLECTION_NAME, userId)
      await setDoc(cartRef, cart)

      return cart
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw new Error('Failed to remove item from cart')
    }
  }

  // Clear cart
  async clearCart(userId: string): Promise<Cart> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId)
      const emptyCart: Cart = {
        id: userId,
        userId,
        items: [],
        total: 0,
        itemCount: 0,
        updatedAt: new Date()
      }
      await setDoc(cartRef, emptyCart)
      return emptyCart
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw new Error('Failed to clear cart')
    }
  }

  // Move item from wishlist to cart
  async moveFromWishlistToCart(userId: string, productId: string, quantity: number = 1): Promise<Cart> {
    try {
      // Add to cart
      const cart = await this.addToCart(userId, productId, quantity)
      
      // Remove from wishlist after successful cart addition
      try {
        const { WishlistService } = await import('./wishlist.service')
        const wishlistService = new WishlistService()
        await wishlistService.removeFromWishlist(userId, productId)
      } catch (error) {
        console.log('Could not remove from wishlist:', error)
        // Non-critical error, don't throw
      }
      
      return cart
    } catch (error) {
      console.error('Error moving from wishlist to cart:', error)
      throw new Error('Failed to move item from wishlist to cart')
    }
  }

  // Apply discount to cart
  async applyDiscount(userId: string, discountCode: string, discountAmount: number): Promise<Cart> {
    try {
      const cart = await this.getCart(userId)
      
      // Validate discount code (simple validation for demo)
      const validDiscountCodes = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'WELCOME': 0.15,
        'STUDENT': 0.25
      }
      
      const discountPercentage = validDiscountCodes[discountCode as keyof typeof validDiscountCodes]
      if (!discountPercentage) {
        throw new Error('Invalid discount code')
      }
      
      // Calculate discount amount
      const calculatedDiscount = Math.min(discountAmount, cart.total * discountPercentage)
      
      // Apply discount
      cart.total = Math.max(0, cart.total - discountAmount)
      
      // Save to Firestore
      const cartRef = doc(db, this.COLLECTION_NAME, userId)
      await setDoc(cartRef, cart)

      return cart
    } catch (error) {
      console.error('Error applying discount:', error)
      throw new Error('Failed to apply discount')
    }
  }

  // Calculate shipping cost
  async calculateShipping(userId: string, shippingMethod: string): Promise<number> {
    try {
      const cart = await this.getCart(userId)
      
      // Simple shipping calculation based on item count and total
      let shippingCost = 0
      
      if (cart.total > 100) {
        shippingCost = 0 // Free shipping for orders over $100
      } else if (shippingMethod === 'express') {
        shippingCost = 15
      } else if (shippingMethod === 'standard') {
        shippingCost = 8
      } else {
        shippingCost = 5 // Economy
      }
      
      return shippingCost
    } catch (error) {
      console.error('Error calculating shipping:', error)
      throw new Error('Failed to calculate shipping')
    }
  }

  // Update cart totals
  private updateCartTotals(cart: Cart): void {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    cart.updatedAt = new Date()
  }

  // Validate cart items (check stock, prices, etc.)
  async validateCart(userId: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const cart = await this.getCart(userId)
      const errors: string[] = []

      for (const item of cart.items) {
        const product = await productService.getProduct(item.productId)
        
        if (!product) {
          errors.push(`Product ${item.productId} no longer exists`)
          continue
        }

        if (product.inStock === false) {
          errors.push(`${product.name} is no longer available`)
          continue
        }

        if (product.price !== item.price) {
          errors.push(`Price has changed for ${product.name}`)
          continue
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error) {
      console.error('Error validating cart:', error)
      throw new Error('Failed to validate cart')
    }
  }
}

export const cartService = new CartService() 
