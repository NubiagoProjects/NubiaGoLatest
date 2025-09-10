import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  addDoc,
  FieldValue
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { logger } from '@/lib/utils/logger'

export interface AdminOrder {
  id: string
  orderNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  supplier: {
    id: string
    name: string
    email: string
  }
  items: Array<{
    productId: string
    productName: string
    productImage: string
    quantity: number
    unitPrice: number
    totalPrice: number
    commission: number
  }>
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  paymentMethod: 'credit_card' | 'paypal' | 'mobile_money' | 'bank_transfer'
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
    phone: string
  }
  billingAddress: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  commissionAmount: number
  currency: string
  notes?: string
  adminNotes?: string
  trackingNumber?: string
  estimatedDelivery?: Date
  actualDelivery?: Date | FieldValue
  createdAt: Date
  updatedAt: Date | FieldValue
  lastModifiedBy?: string
  cancellationReason?: string
  refundReason?: string
  refundAmount?: number
  refundDate?: Date | FieldValue
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalCommission: number
  ordersThisMonth: number
  revenueThisMonth: number
  ordersThisWeek: number
  revenueThisWeek: number
}

export interface OrderFilters {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  customer?: string
  supplier?: string
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  search?: string
}

export class AdminOrderService {
  private ordersCollection = collection(db, 'orders')
  private adminActionsCollection = collection(db, 'admin_actions')

  // Get all orders with pagination and filters
  async getOrders(
    filters: OrderFilters = {},
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{ orders: AdminOrder[]; lastDoc: any; hasMore: boolean }> {
    try {
      let q = query(this.ordersCollection, orderBy('createdAt', 'desc'), limit(pageSize))
      
      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.paymentStatus) {
        q = query(q, where('paymentStatus', '==', filters.paymentStatus))
      }
      
      if (filters.customer) {
        q = query(q, where('customer.id', '==', filters.customer))
      }
      
      if (filters.supplier) {
        q = query(q, where('supplier.id', '==', filters.supplier))
      }
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      let orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminOrder[]

      // Apply additional filters that can't be done in Firestore
      if (filters.dateRange) {
        orders = orders.filter(o => {
          const orderDate = new Date(o.createdAt)
          return orderDate >= filters.dateRange!.start && orderDate <= filters.dateRange!.end
        })
      }
      
      if (filters.amountRange) {
        orders = orders.filter(o => 
          o.totalAmount >= filters.amountRange!.min && o.totalAmount <= filters.amountRange!.max
        )
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        orders = orders.filter(o => 
          o.orderNumber.toLowerCase().includes(searchLower) ||
          o.customer.name.toLowerCase().includes(searchLower) ||
          o.customer.email.toLowerCase().includes(searchLower) ||
          o.supplier.name.toLowerCase().includes(searchLower) ||
          o.items.some(item => item.productName.toLowerCase().includes(searchLower))
        )
      }

      const hasMore = snapshot.docs.length === pageSize
      const lastVisible = snapshot.docs[snapshot.docs.length - 1]

      return { orders, lastDoc: lastVisible, hasMore }
    } catch (error) {
      logger.error('Error fetching orders:', error)
      throw new Error('Failed to fetch orders')
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<AdminOrder | null> {
    try {
      const docRef = doc(db, 'orders', id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AdminOrder
    } catch (error) {
      logger.error('Error fetching order:', error)
      throw new Error('Failed to fetch order')
    }
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    newStatus: AdminOrder['status'],
    adminId: string,
    notes?: string,
    trackingNumber?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update order status
      const orderRef = doc(db, 'orders', orderId)
      const updates: Partial<AdminOrder> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      }

      if (notes) {
        updates.adminNotes = notes
      }

      if (trackingNumber) {
        updates.trackingNumber = trackingNumber
      }

      // Set delivery date if order is delivered
      if (newStatus === 'delivered') {
        updates.actualDelivery = serverTimestamp()
      }

      batch.update(orderRef, updates)

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'update_order_status',
        targetOrderId: orderId,
        oldStatus: (await this.getOrderById(orderId))?.status,
        newStatus,
        notes,
        trackingNumber,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Order ${orderId} status updated to ${newStatus} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }

  // Cancel order
  async cancelOrder(
    orderId: string,
    adminId: string,
    reason: string,
    refundAmount?: number
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update order status
      const orderRef = doc(db, 'orders', orderId)
      const updates: Partial<AdminOrder> = {
        status: 'cancelled',
        cancellationReason: reason,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      }

      if (refundAmount) {
        updates.refundAmount = refundAmount
        updates.refundDate = serverTimestamp()
        updates.paymentStatus = 'refunded'
      }

      batch.update(orderRef, updates)

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'cancel_order',
        targetOrderId: orderId,
        reason,
        refundAmount,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Order ${orderId} cancelled by admin ${adminId}`)
    } catch (error) {
      logger.error('Error cancelling order:', error)
      throw new Error('Failed to cancel order')
    }
  }

  // Process refund
  async processRefund(
    orderId: string,
    adminId: string,
    refundAmount: number,
    reason: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update order refund information
      const orderRef = doc(db, 'orders', orderId)
      batch.update(orderRef, {
        refundAmount,
        refundReason: reason,
        refundDate: serverTimestamp(),
        paymentStatus: 'refunded',
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      })

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'process_refund',
        targetOrderId: orderId,
        refundAmount,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Refund processed for order ${orderId} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error processing refund:', error)
      throw new Error('Failed to process refund')
    }
  }

  // Bulk update orders
  async bulkUpdateOrders(
    orderIds: string[],
    updates: Partial<AdminOrder>,
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update each order
      for (const orderId of orderIds) {
        const orderRef = doc(db, 'orders', orderId)
        batch.update(orderRef, {
          ...updates,
          updatedAt: serverTimestamp(),
          lastModifiedBy: adminId
        })
      }

      // Log bulk admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'bulk_update_orders',
        targetOrderIds: orderIds,
        updates,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Bulk updated ${orderIds.length} orders by admin ${adminId}`)
    } catch (error) {
      logger.error('Error bulk updating orders:', error)
      throw new Error('Failed to bulk update orders')
    }
  }

  // Get order statistics
  async getOrderStats(): Promise<OrderStats> {
    try {
      const stats: OrderStats = {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalCommission: 0,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
        ordersThisWeek: 0,
        revenueThisWeek: 0
      }

      // Get all orders for stats calculation
      const snapshot = await getDocs(this.ordersCollection)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminOrder[]

      // Calculate basic stats
      stats.totalOrders = orders.length
      stats.pendingOrders = orders.filter(o => o.status === 'pending').length
      stats.processingOrders = orders.filter(o => o.status === 'processing').length
      stats.shippedOrders = orders.filter(o => o.status === 'shipped').length
      stats.deliveredOrders = orders.filter(o => o.status === 'delivered').length
      stats.cancelledOrders = orders.filter(o => o.status === 'cancelled').length

      // Calculate financial stats
      const completedOrders = orders.filter(o => 
        o.status === 'delivered' && o.paymentStatus === 'paid'
      )
      
      if (completedOrders.length > 0) {
        stats.totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        stats.averageOrderValue = stats.totalRevenue / completedOrders.length
        stats.totalCommission = completedOrders.reduce((sum, o) => sum + o.commissionAmount, 0)
      }

      // Calculate monthly and weekly stats
      const now = new Date()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const monthOrders = orders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= monthAgo
      )
      stats.ordersThisMonth = monthOrders.length
      stats.revenueThisMonth = monthOrders
        .filter(o => o.status === 'delivered' && o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.totalAmount, 0)

      const weekOrders = orders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= weekAgo
      )
      stats.ordersThisWeek = weekOrders.length
      stats.revenueThisWeek = weekOrders
        .filter(o => o.status === 'delivered' && o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.totalAmount, 0)

      return stats
    } catch (error) {
      logger.error('Error fetching order stats:', error)
      throw new Error('Failed to fetch order statistics')
    }
  }

  // Subscribe to real-time order updates
  subscribeToOrders(
    filters: OrderFilters = {},
    callback: (orders: AdminOrder[]) => void
  ): () => void {
    try {
      let q = query(this.ordersCollection, orderBy('createdAt', 'desc'))
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.paymentStatus) {
        q = query(q, where('paymentStatus', '==', filters.paymentStatus))
      }
      
      if (filters.customer) {
        q = query(q, where('customer.id', '==', filters.customer))
      }
      
      if (filters.supplier) {
        q = query(q, where('supplier.id', '==', filters.supplier))
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminOrder[]

        // Apply additional filters
        if (filters.dateRange) {
          orders = orders.filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate >= filters.dateRange!.start && orderDate <= filters.dateRange!.end
          })
        }
        
        if (filters.amountRange) {
          orders = orders.filter(o => 
            o.totalAmount >= filters.amountRange!.min && o.totalAmount <= filters.amountRange!.max
          )
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          orders = orders.filter(o => 
            o.orderNumber.toLowerCase().includes(searchLower) ||
            o.customer.name.toLowerCase().includes(searchLower) ||
            o.customer.email.toLowerCase().includes(searchLower)
          )
        }

        callback(orders)
      }, (error) => {
        logger.error('Error in order subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up order subscription:', error)
      return () => {}
    }
  }

  // Subscribe to real-time order stats
  subscribeToOrderStats(callback: (stats: OrderStats) => void): () => void {
    try {
      const unsubscribe = onSnapshot(this.ordersCollection, async () => {
        const stats = await this.getOrderStats()
        callback(stats)
      }, (error) => {
        logger.error('Error in order stats subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up order stats subscription:', error)
      return () => {}
    }
  }
}
