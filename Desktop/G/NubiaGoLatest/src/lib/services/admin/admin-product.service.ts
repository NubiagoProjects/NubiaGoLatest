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
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { logger } from '@/lib/utils/logger'

export interface AdminProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  minStock: number
  maxStock: number
  status: 'active' | 'inactive' | 'draft' | 'archived' | 'pending_approval'
  category: string
  subcategory?: string
  supplier: {
    id: string
    name: string
    email: string
  }
  sales: number
  rating: number
  reviewCount: number
  images: string[]
  mainImage: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt: Date
  approvedAt?: Date
  approvedBy?: string
  isFeatured: boolean
  isPromoted: boolean
  commissionRate: number
  tags: string[]
  specifications: Record<string, any>
  shipping: {
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    freeShipping: boolean
    shippingCost: number
  }
  createdAt: Date
  updatedAt: Date
  lastModifiedBy?: string
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  pendingApproval: number
  lowStockProducts: number
  outOfStockProducts: number
  totalCategories: number
  totalSuppliers: number
  averagePrice: number
  totalSales: number
  featuredProducts: number
}

export interface ProductFilters {
  status?: 'active' | 'inactive' | 'draft' | 'archived' | 'pending_approval'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  category?: string
  supplier?: string
  priceRange?: {
    min: number
    max: number
  }
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  search?: string
  isFeatured?: boolean
  isPromoted?: boolean
}

export class AdminProductService {
  private productsCollection = collection(db, 'products')
  private adminActionsCollection = collection(db, 'admin_actions')
  private categoriesCollection = collection(db, 'categories')

  // Get all products with pagination and filters
  async getProducts(
    filters: ProductFilters = {},
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{ products: AdminProduct[]; lastDoc: any; hasMore: boolean }> {
    try {
      let q = query(this.productsCollection, orderBy('createdAt', 'desc'), limit(pageSize))
      
      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.approvalStatus) {
        q = query(q, where('approvalStatus', '==', filters.approvalStatus))
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      if (filters.supplier) {
        q = query(q, where('supplier.id', '==', filters.supplier))
      }
      
      if (filters.isFeatured !== undefined) {
        q = query(q, where('isFeatured', '==', filters.isFeatured))
      }
      
      if (filters.isPromoted !== undefined) {
        q = query(q, where('isPromoted', '==', filters.isPromoted))
      }
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminProduct[]

      // Apply additional filters that can't be done in Firestore
      if (filters.priceRange) {
        products = products.filter(p => 
          p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
        )
      }
      
      if (filters.stockStatus) {
        switch (filters.stockStatus) {
          case 'in_stock':
            products = products.filter(p => p.stock > p.minStock)
            break
          case 'low_stock':
            products = products.filter(p => p.stock <= p.minStock && p.stock > 0)
            break
          case 'out_of_stock':
            products = products.filter(p => p.stock === 0)
            break
        }
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower) ||
          p.supplier.name.toLowerCase().includes(searchLower)
        )
      }

      const hasMore = snapshot.docs.length === pageSize
      const lastVisible = snapshot.docs[snapshot.docs.length - 1]

      return { products, lastDoc: lastVisible, hasMore }
    } catch (error) {
      logger.error('Error fetching products:', error)
      throw new Error('Failed to fetch products')
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<AdminProduct | null> {
    try {
      const docRef = doc(db, 'products', id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AdminProduct
    } catch (error) {
      logger.error('Error fetching product:', error)
      throw new Error('Failed to fetch product')
    }
  }

  // Approve or reject product
  async updateProductApproval(
    productId: string,
    approvalStatus: 'approved' | 'rejected',
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update product approval status
      const productRef = doc(db, 'products', productId)
      batch.update(productRef, {
        approvalStatus,
        approvalNotes: notes,
        approvedAt: approvalStatus === 'approved' ? serverTimestamp() : null,
        approvedBy: approvalStatus === 'approved' ? adminId : null,
        status: approvalStatus === 'approved' ? 'active' : 'inactive',
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      })

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'update_product_approval',
        targetProductId: productId,
        oldApprovalStatus: (await this.getProductById(productId))?.approvalStatus,
        newApprovalStatus: approvalStatus,
        notes,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Product ${productId} approval status updated to ${approvalStatus} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating product approval:', error)
      throw new Error('Failed to update product approval')
    }
  }

  // Update product status
  async updateProductStatus(
    productId: string,
    newStatus: 'active' | 'inactive' | 'draft' | 'archived',
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update product status
      const productRef = doc(db, 'products', productId)
      batch.update(productRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      })

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'update_product_status',
        targetProductId: productId,
        oldStatus: (await this.getProductById(productId))?.status,
        newStatus,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Product ${productId} status updated to ${newStatus} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating product status:', error)
      throw new Error('Failed to update product status')
    }
  }

  // Bulk update products
  async bulkUpdateProducts(
    productIds: string[],
    updates: Partial<AdminProduct>,
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update each product
      for (const productId of productIds) {
        const productRef = doc(db, 'products', productId)
        batch.update(productRef, {
          ...updates,
          updatedAt: serverTimestamp(),
          lastModifiedBy: adminId
        })
      }

      // Log bulk admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'bulk_update_products',
        targetProductIds: productIds,
        updates,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Bulk updated ${productIds.length} products by admin ${adminId}`)
    } catch (error) {
      logger.error('Error bulk updating products:', error)
      throw new Error('Failed to bulk update products')
    }
  }

  // Delete product (soft delete)
  async deleteProduct(productId: string, adminId: string, reason?: string): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Soft delete product
      const productRef = doc(db, 'products', productId)
      batch.update(productRef, {
        status: 'deleted',
        deletedAt: serverTimestamp(),
        deletedBy: adminId,
        deleteReason: reason,
        updatedAt: serverTimestamp()
      })

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'delete_product',
        targetProductId: productId,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Product ${productId} deleted by admin ${adminId}`)
    } catch (error) {
      logger.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
  }

  // Get product statistics
  async getProductStats(): Promise<ProductStats> {
    try {
      const stats: ProductStats = {
        totalProducts: 0,
        activeProducts: 0,
        pendingApproval: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalCategories: 0,
        totalSuppliers: 0,
        averagePrice: 0,
        totalSales: 0,
        featuredProducts: 0
      }

      // Get all products for stats calculation
      const snapshot = await getDocs(this.productsCollection)
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminProduct[]

      // Calculate stats
      stats.totalProducts = products.length
      stats.activeProducts = products.filter(p => p.status === 'active').length
      stats.pendingApproval = products.filter(p => p.approvalStatus === 'pending').length
      stats.lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0).length
      stats.outOfStockProducts = products.filter(p => p.stock === 0).length
      stats.featuredProducts = products.filter(p => p.isFeatured).length

      // Calculate unique categories and suppliers
      const categories = new Set(products.map(p => p.category))
      const suppliers = new Set(products.map(p => p.supplier.id))
      stats.totalCategories = categories.size
      stats.totalSuppliers = suppliers.size

      // Calculate average price and total sales
      const activeProducts = products.filter(p => p.status === 'active')
      if (activeProducts.length > 0) {
        stats.averagePrice = activeProducts.reduce((sum, p) => sum + p.price, 0) / activeProducts.length
        stats.totalSales = activeProducts.reduce((sum, p) => sum + p.sales, 0)
      }

      return stats
    } catch (error) {
      logger.error('Error fetching product stats:', error)
      throw new Error('Failed to fetch product statistics')
    }
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      const snapshot = await getDocs(this.categoriesCollection)
      return snapshot.docs.map(doc => doc.data().name)
    } catch (error) {
      logger.error('Error fetching categories:', error)
      return []
    }
  }

  // Subscribe to real-time product updates
  subscribeToProducts(
    filters: ProductFilters = {},
    callback: (products: AdminProduct[]) => void
  ): () => void {
    try {
      let q = query(this.productsCollection, orderBy('createdAt', 'desc'))
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.approvalStatus) {
        q = query(q, where('approvalStatus', '==', filters.approvalStatus))
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      if (filters.supplier) {
        q = query(q, where('supplier.id', '==', filters.supplier))
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminProduct[]

        // Apply additional filters
        if (filters.priceRange) {
          products = products.filter(p => 
            p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
          )
        }
        
        if (filters.stockStatus) {
          switch (filters.stockStatus) {
            case 'in_stock':
              products = products.filter(p => p.stock > p.minStock)
              break
            case 'low_stock':
              products = products.filter(p => p.stock <= p.minStock && p.stock > 0)
              break
            case 'out_of_stock':
              products = products.filter(p => p.stock === 0)
              break
          }
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          products = products.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
          )
        }

        callback(products)
      }, (error) => {
        logger.error('Error in product subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up product subscription:', error)
      return () => {}
    }
  }

  // Subscribe to real-time product stats
  subscribeToProductStats(callback: (stats: ProductStats) => void): () => void {
    try {
      const unsubscribe = onSnapshot(this.productsCollection, async () => {
        const stats = await this.getProductStats()
        callback(stats)
      }, (error) => {
        logger.error('Error in product stats subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up product stats subscription:', error)
      return () => {}
    }
  }
}
