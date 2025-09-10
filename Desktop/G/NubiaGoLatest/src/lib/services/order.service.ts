import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order, OrderItem, OrderStatus, PaymentStatus, Address, Product } from '@/types'
import { cartService } from './cart.service'
import { productService } from './product.service'
import { paymentService } from './payment.service'
import { emailService } from './email.service'

export interface InventoryItem {
  productId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lowStockThreshold: number
  lastUpdated: Date
}

export interface OrderProcessingResult {
  success: boolean
  order?: Order
  error?: string
  inventoryUpdates?: InventoryItem[]
  paymentResult?: any
}

export class OrderService {
  private readonly COLLECTION_NAME = 'orders'
  private readonly INVENTORY_COLLECTION = 'inventory'

  // Comprehensive order processing with inventory and payment integration
  async processOrder(orderData: {
    userId: string
    items: OrderItem[]
    shippingAddress: Address
    billingAddress: Address
    paymentMethod: string
    shippingMethod: string
    customerEmail: string
    customerName: string
    notes?: string
  }): Promise<OrderProcessingResult> {
    try {
      // Step 1: Validate and reserve inventory
      const inventoryResult = await this.reserveInventory(orderData.items)
      if (!inventoryResult.success) {
        return {
          success: false,
          error: `Inventory reservation failed: ${inventoryResult.error}`
        }
      }

      // Step 2: Create order
      const order = await this.createOrder(orderData)
      
      // Step 3: Process payment
      const paymentResult = await this.processOrderPayment(order, {
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        paymentMethod: orderData.paymentMethod
      })

      if (!paymentResult.success) {
        // Rollback inventory reservation
        await this.releaseInventoryReservation(orderData.items)
        return {
          success: false,
          error: `Payment processing failed: ${paymentResult.error}`,
          order
        }
      }

      // Step 4: Confirm inventory allocation
      await this.confirmInventoryAllocation(orderData.items)

      // Step 5: Update order status
      const confirmedOrder = await this.updateOrderStatus(order.id, 'confirmed')
      await this.updatePaymentStatus(order.id, 'paid')

      // Send confirmation email
      try {
        await emailService.sendOrderConfirmation(
          { 
            uid: 'temp-user-id',
            email: orderData.customerEmail, 
            name: orderData.customerName,
            role: 'customer',
            createdAt: new Date()
          },
          confirmedOrder
        )
      } catch (emailError) {
        console.warn('Failed to send order confirmation email:', emailError)
      }

      return {
        success: true,
        order: confirmedOrder,
        inventoryUpdates: inventoryResult.inventoryUpdates,
        paymentResult
      }
    } catch (error) {
      console.error('Order processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Order processing failed'
      }
    }
  }

  // Create new order (public method)
  async createOrder(orderData: {
    userId: string
    items: OrderItem[]
    shippingAddress: Address
    billingAddress: Address
    paymentMethod: string
    shippingMethod: string
    notes?: string
  }): Promise<Order> {
    try {
      // Validate cart before creating order
      const cartValidation = await cartService.validateCart(orderData.userId)
      if (!cartValidation.isValid) {
        throw new Error(`Cart validation failed: ${cartValidation.errors.join(', ')}`)
      }

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const shipping = await cartService.calculateShipping(orderData.userId, orderData.shippingMethod)
      const tax = subtotal * 0.1 // 10% tax rate
      const total = subtotal + shipping + tax

      // Create order
      const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: orderData.userId,
        items: orderData.items,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save order to Firestore
      const orderRef = doc(db, this.COLLECTION_NAME, newOrder.id)
      await setDoc(orderRef, newOrder)

      // Clear cart after successful order creation
      await cartService.clearCart(orderData.userId)

      return newOrder
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      const orderDoc = await getDoc(orderRef)

      if (!orderDoc.exists()) {
        return null
      }

      return orderDoc.data() as Order
    } catch (error) {
      console.error('Error getting order:', error)
      // During build time, return null instead of throwing
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return null
      }
      throw new Error('Failed to fetch order')
    }
  }

  // Get user's orders
  async getUserOrders(userId: string, page: number = 1, limit: number = 20): Promise<{
    orders: Order[]
    total: number
    hasMore: boolean
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = orders.slice(startIndex, endIndex)

      return {
        orders: paginatedOrders,
        total: orders.length,
        hasMore: endIndex < orders.length
      }
    } catch (error) {
      console.error('Error getting user orders:', error)
      // During build time, return empty array instead of throwing
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return {
          orders: [],
          total: 0,
          hasMore: false
        }
      }
      throw new Error('Failed to fetch user orders')
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        paymentStatus,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  // Add tracking number
  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<Order> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        trackingNumber,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error adding tracking number:', error)
      throw new Error('Failed to add tracking number')
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status === 'shipped' || order.status === 'delivered') {
        throw new Error('Cannot cancel shipped or delivered order')
      }

      // Update order status
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: new Date()
      })

      // Restore items to inventory if needed
      // Restore inventory
      await this.releaseInventoryReservation(order.items)

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw new Error('Failed to cancel order')
    }
  }

  // Process order payment with full integration
  private async processOrderPayment(order: Order, paymentData: {
    customerEmail: string
    customerName: string
    paymentMethod: string
  }): Promise<{ success: boolean; error?: string; transactionId?: string }> {
    try {
      const paymentRequest = {
        amount: order.total,
        currency: 'USD',
        orderId: order.id,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        customerPhone: '', // Could be added to order data
        paymentMethod: paymentData.paymentMethod as 'card' | 'mobile_money' | 'bank_transfer',
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/cancel`,
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/payment`
      }

      const paymentResult = await paymentService.initiatePayment(paymentRequest)
      
      if (paymentResult.success) {
        return {
          success: true,
          transactionId: paymentResult.transactionId
        }
      } else {
        return {
          success: false,
          error: paymentResult.message
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  // Get order statistics
  async getOrderStatistics(userId: string): Promise<{
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    pendingOrders: number
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      const totalOrders = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'confirmed'
      ).length

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        pendingOrders
      }
    } catch (error) {
      console.error('Error getting order statistics:', error)
      throw new Error('Failed to fetch order statistics')
    }
  }

  // Get all orders (admin only)
  async getAllOrders(page: number = 1, limit: number = 50, status?: OrderStatus): Promise<{
    orders: Order[]
    total: number
    hasMore: boolean
  }> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      )

      if (status) {
        q = query(q, where('status', '==', status))
      }

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = orders.slice(startIndex, endIndex)

      return {
        orders: paginatedOrders,
        total: orders.length,
        hasMore: endIndex < orders.length
      }
    } catch (error) {
      console.error('Error getting all orders:', error)
      throw new Error('Failed to fetch orders')
    }
  }

  // Refund order
  async refundOrder(orderId: string, refundAmount: number, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.paymentStatus !== 'paid') {
        throw new Error('Order is not paid')
      }

      // Process refund through payment gateway
      const refundResult = await paymentService.processRefund({
        paymentId: order.id,
        amount: refundAmount,
        reason: reason || 'Customer requested refund'
      })

      if (!refundResult.success) {
        throw new Error(`Refund processing failed: ${refundResult.message}`)
      }

      // Update order status
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status: 'refunded',
        paymentStatus: 'refunded',
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error refunding order:', error)
      throw new Error('Failed to refund order')
    }
  }

  // Inventory Management Methods
  async reserveInventory(items: OrderItem[]): Promise<{
    success: boolean
    error?: string
    inventoryUpdates?: InventoryItem[]
  }> {
    try {
      const inventoryUpdates: InventoryItem[] = []
      
      for (const item of items) {
        const inventoryRef = doc(db, this.INVENTORY_COLLECTION, item.productId)
        const inventoryDoc = await getDoc(inventoryRef)
        
        let inventory: InventoryItem
        
        if (inventoryDoc.exists()) {
          inventory = inventoryDoc.data() as InventoryItem
        } else {
          // Create new inventory record
          inventory = {
            productId: item.productId,
            quantity: 100, // Default stock
            reservedQuantity: 0,
            availableQuantity: 100,
            lowStockThreshold: 10,
            lastUpdated: new Date()
          }
        }
        
        // Check availability
        if (inventory.availableQuantity < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for product ${item.productId}. Available: ${inventory.availableQuantity}, Requested: ${item.quantity}`
          }
        }
        
        // Reserve inventory
        inventory.reservedQuantity += item.quantity
        inventory.availableQuantity -= item.quantity
        inventory.lastUpdated = new Date()
        
        await setDoc(inventoryRef, inventory)
        inventoryUpdates.push(inventory)
      }
      
      return {
        success: true,
        inventoryUpdates
      }
    } catch (error) {
      console.error('Inventory reservation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Inventory reservation failed'
      }
    }
  }
  
  async confirmInventoryAllocation(items: OrderItem[]): Promise<void> {
    try {
      for (const item of items) {
        const inventoryRef = doc(db, this.INVENTORY_COLLECTION, item.productId)
        const inventoryDoc = await getDoc(inventoryRef)
        
        if (inventoryDoc.exists()) {
          const inventory = inventoryDoc.data() as InventoryItem
          
          // Move from reserved to allocated (reduce total quantity)
          inventory.quantity -= item.quantity
          inventory.reservedQuantity -= item.quantity
          inventory.lastUpdated = new Date()
          
          await updateDoc(inventoryRef, {
            quantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity,
            lastUpdated: inventory.lastUpdated
          })
          
          // Check for low stock alert
          if (inventory.quantity <= inventory.lowStockThreshold) {
            console.warn(`Low stock alert for product ${item.productId}: ${inventory.quantity} remaining`)
          }
        }
      }
    } catch (error) {
      console.error('Inventory allocation confirmation error:', error)
      throw new Error('Failed to confirm inventory allocation')
    }
  }
  
  async releaseInventoryReservation(items: OrderItem[]): Promise<void> {
    try {
      for (const item of items) {
        const inventoryRef = doc(db, this.INVENTORY_COLLECTION, item.productId)
        const inventoryDoc = await getDoc(inventoryRef)
        
        if (inventoryDoc.exists()) {
          const inventory = inventoryDoc.data() as InventoryItem
          
          // Release reservation
          inventory.reservedQuantity -= item.quantity
          inventory.availableQuantity += item.quantity
          inventory.lastUpdated = new Date()
          
          await updateDoc(inventoryRef, {
            reservedQuantity: inventory.reservedQuantity,
            availableQuantity: inventory.availableQuantity,
            lastUpdated: inventory.lastUpdated
          })
        }
      }
    } catch (error) {
      console.error('Inventory reservation release error:', error)
      throw new Error('Failed to release inventory reservation')
    }
  }
  
  async getInventoryStatus(productId: string): Promise<InventoryItem | null> {
    try {
      const inventoryRef = doc(db, this.INVENTORY_COLLECTION, productId)
      const inventoryDoc = await getDoc(inventoryRef)
      
      if (inventoryDoc.exists()) {
        return inventoryDoc.data() as InventoryItem
      }
      
      return null
    } catch (error) {
      console.error('Error getting inventory status:', error)
      return null
    }
  }
  
  async updateInventory(productId: string, quantity: number): Promise<InventoryItem> {
    try {
      const inventoryRef = doc(db, this.INVENTORY_COLLECTION, productId)
      const inventoryDoc = await getDoc(inventoryRef)
      
      let inventory: InventoryItem
      
      if (inventoryDoc.exists()) {
        inventory = inventoryDoc.data() as InventoryItem
        inventory.quantity = quantity
        inventory.availableQuantity = quantity - inventory.reservedQuantity
      } else {
        inventory = {
          productId,
          quantity,
          reservedQuantity: 0,
          availableQuantity: quantity,
          lowStockThreshold: 10,
          lastUpdated: new Date()
        }
      }
      
      inventory.lastUpdated = new Date()
      await setDoc(inventoryRef, inventory)
      
      return inventory
    } catch (error) {
      console.error('Error updating inventory:', error)
      throw new Error('Failed to update inventory')
    }
  }
  
  // Order fulfillment workflow
  async fulfillOrder(orderId: string, trackingNumber?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }
      
      if (order.status !== 'confirmed') {
        throw new Error('Order must be confirmed before fulfillment')
      }
      
      // Update order status to shipped
      const updatedOrder = await this.updateOrderStatus(orderId, 'shipped')
      
      if (trackingNumber) {
        await this.addTrackingNumber(orderId, trackingNumber)
      }
      
      // Send shipping notification email
      try {
        await emailService.sendOrderShipped(
          { 
            uid: 'temp-user-id',
            email: order.userId, // Use userId as email fallback
            name: 'Customer',
            role: 'customer',
            createdAt: new Date()
          },
          updatedOrder,
          trackingNumber
        )
      } catch (emailError) {
        console.warn('Failed to send shipping notification:', emailError)
      }
      
      return updatedOrder
    } catch (error) {
      console.error('Order fulfillment error:', error)
      throw new Error('Failed to fulfill order')
    }
  }
}

export const orderService = new OrderService()
