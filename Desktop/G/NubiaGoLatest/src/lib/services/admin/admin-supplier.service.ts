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

export interface AdminSupplier {
  id: string
  uid: string
  businessName: string
  businessType: string
  businessDescription?: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  businessAddress: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  businessPhone: string
  businessEmail: string
  website?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt: Date
  approvedAt?: Date | FieldValue
  approvedBy?: string
  rejectionReason?: string
  suspendedReason?: string
  suspendedAt?: Date | FieldValue
  suspendedBy?: string
  suspensionEndDate?: Date | FieldValue
  documents: {
    businessLicense?: string
    taxCertificate?: string
    bankStatement?: string
    identityDocument?: string
    otherDocuments?: string[]
  }
  verificationStatus: {
    emailVerified: boolean
    phoneVerified: boolean
    documentsVerified: boolean
    businessVerified: boolean
  }
  businessMetrics: {
    totalProducts: number
    activeProducts: number
    totalOrders: number
    completedOrders: number
    totalRevenue: number
    averageRating: number
    reviewCount: number
    responseRate: number
    averageResponseTime: number
  }
  commissionRate: number
  paymentInfo: {
    bankName?: string
    accountNumber?: string
    routingNumber?: string
    paypalEmail?: string
    mobileMoneyNumber?: string
  }
  categories: string[]
  tags: string[]
  isFeatured: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date | FieldValue
  lastModifiedBy?: string
}

export interface SupplierStats {
  totalSuppliers: number
  approvedSuppliers: number
  pendingSuppliers: number
  rejectedSuppliers: number
  suspendedSuppliers: number
  totalRevenue: number
  averageRating: number
  totalProducts: number
  activeCategories: number
  newSuppliersThisMonth: number
  topPerformingSuppliers: number
}

export interface SupplierFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  businessType?: string
  category?: string
  verificationStatus?: 'verified' | 'unverified'
  isFeatured?: boolean
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export class AdminSupplierService {
  private suppliersCollection = collection(db, 'suppliers')
  private adminActionsCollection = collection(db, 'admin_actions')
  private usersCollection = collection(db, 'users')

  // Get all suppliers with pagination and filters
  async getSuppliers(
    filters: SupplierFilters = {},
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{ suppliers: AdminSupplier[]; lastDoc: any; hasMore: boolean }> {
    try {
      let q = query(this.suppliersCollection, orderBy('createdAt', 'desc'), limit(pageSize))
      
      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.approvalStatus) {
        q = query(q, where('approvalStatus', '==', filters.approvalStatus))
      }
      
      if (filters.businessType) {
        q = query(q, where('businessType', '==', filters.businessType))
      }
      
      if (filters.category) {
        q = query(q, where('categories', 'array-contains', filters.category))
      }
      
      if (filters.isFeatured !== undefined) {
        q = query(q, where('isFeatured', '==', filters.isFeatured))
      }
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      let suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminSupplier[]

      // Apply additional filters that can't be done in Firestore
      if (filters.verificationStatus) {
        suppliers = suppliers.filter(s => {
          const isVerified = s.verificationStatus.emailVerified && 
                           s.verificationStatus.phoneVerified && 
                           s.verificationStatus.documentsVerified
          return filters.verificationStatus === 'verified' ? isVerified : !isVerified
        })
      }
      
      if (filters.dateRange?.start && filters.dateRange?.end) {
        suppliers = suppliers.filter(s => {
          const submitDate = new Date(s.submittedAt)
          return submitDate >= filters.dateRange!.start && submitDate <= filters.dateRange!.end
        })
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        suppliers = suppliers.filter(s => 
          s.businessName.toLowerCase().includes(searchLower) ||
          s.ownerName.toLowerCase().includes(searchLower) ||
          s.ownerEmail.toLowerCase().includes(searchLower) ||
          s.businessType.toLowerCase().includes(searchLower) ||
          s.categories.some(cat => cat.toLowerCase().includes(searchLower))
        )
      }

      const hasMore = snapshot.docs.length === pageSize
      const lastVisible = snapshot.docs[snapshot.docs.length - 1]

      return { suppliers, lastDoc: lastVisible, hasMore }
    } catch (error) {
      logger.error('Error fetching suppliers:', error)
      throw new Error('Failed to fetch suppliers')
    }
  }

  // Get supplier by ID
  async getSupplierById(id: string): Promise<AdminSupplier | null> {
    try {
      const docRef = doc(db, 'suppliers', id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AdminSupplier
    } catch (error) {
      logger.error('Error fetching supplier:', error)
      throw new Error('Failed to fetch supplier')
    }
  }

  // Approve or reject supplier
  async updateSupplierApproval(
    supplierId: string,
    approvalStatus: 'approved' | 'rejected',
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update supplier approval status
      const supplierRef = doc(db, 'suppliers', supplierId)
      const updates: Partial<AdminSupplier> = {
        approvalStatus,
        approvalNotes: notes,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      }

      if (approvalStatus === 'approved') {
        updates.approvedAt = serverTimestamp()
        updates.approvedBy = adminId
        updates.status = 'approved'
      } else if (approvalStatus === 'rejected') {
        updates.rejectionReason = notes
        updates.status = 'rejected'
      }

      batch.update(supplierRef, updates)

      // Update user status if supplier is approved
      if (approvalStatus === 'approved') {
        const supplier = await this.getSupplierById(supplierId)
        if (supplier) {
          const userRef = doc(db, 'users', supplier.uid)
          batch.update(userRef, {
            status: 'active',
            updatedAt: serverTimestamp()
          })
        }
      }

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'update_supplier_approval',
        targetSupplierId: supplierId,
        oldApprovalStatus: (await this.getSupplierById(supplierId))?.approvalStatus,
        newApprovalStatus: approvalStatus,
        notes,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Supplier ${supplierId} approval status updated to ${approvalStatus} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating supplier approval:', error)
      throw new Error('Failed to update supplier approval')
    }
  }

  // Suspend supplier
  async suspendSupplier(
    supplierId: string,
    adminId: string,
    reason: string,
    duration?: number // in days
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update supplier status
      const supplierRef = doc(db, 'suppliers', supplierId)
      const updates: Partial<AdminSupplier> = {
        status: 'suspended',
        suspendedReason: reason,
        suspendedAt: serverTimestamp(),
        suspendedBy: adminId,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      }

      if (duration) {
        const suspensionEnd = new Date()
        suspensionEnd.setDate(suspensionEnd.getDate() + duration)
        updates.suspensionEndDate = suspensionEnd
      }

      batch.update(supplierRef, updates)

      // Update user status
      const supplier = await this.getSupplierById(supplierId)
      if (supplier) {
        const userRef = doc(db, 'users', supplier.uid)
        batch.update(userRef, {
          status: 'suspended',
          updatedAt: serverTimestamp()
        })
      }

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'suspend_supplier',
        targetSupplierId: supplierId,
        reason,
        duration,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Supplier ${supplierId} suspended by admin ${adminId}`)
    } catch (error) {
      logger.error('Error suspending supplier:', error)
      throw new Error('Failed to suspend supplier')
    }
  }

  // Reactivate supplier
  async reactivateSupplier(
    supplierId: string,
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update supplier status
      const supplierRef = doc(db, 'suppliers', supplierId)
      batch.update(supplierRef, {
        status: 'approved',
        suspendedReason: null,
        suspendedAt: null,
        suspendedBy: null,
        suspensionEndDate: null,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      })

      // Update user status
      const supplier = await this.getSupplierById(supplierId)
      if (supplier) {
        const userRef = doc(db, 'users', supplier.uid)
        batch.update(userRef, {
          status: 'active',
          updatedAt: serverTimestamp()
        })
      }

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'reactivate_supplier',
        targetSupplierId: supplierId,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Supplier ${supplierId} reactivated by admin ${adminId}`)
    } catch (error) {
      logger.error('Error reactivating supplier:', error)
      throw new Error('Failed to reactivate supplier')
    }
  }

  // Update supplier verification status
  async updateVerificationStatus(
    supplierId: string,
    verificationType: keyof AdminSupplier['verificationStatus'],
    verified: boolean,
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update verification status
      const supplierRef = doc(db, 'suppliers', supplierId)
      const updatePath = `verificationStatus.${verificationType}`
      batch.update(supplierRef, {
        [updatePath]: verified,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId
      })

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'update_verification_status',
        targetSupplierId: supplierId,
        verificationType,
        verified,
        notes,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Supplier ${supplierId} ${verificationType} verification updated to ${verified} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating verification status:', error)
      throw new Error('Failed to update verification status')
    }
  }

  // Bulk update suppliers
  async bulkUpdateSuppliers(
    supplierIds: string[],
    updates: Partial<AdminSupplier>,
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update each supplier
      for (const supplierId of supplierIds) {
        const supplierRef = doc(db, 'suppliers', supplierId)
        batch.update(supplierRef, {
          ...updates,
          updatedAt: serverTimestamp(),
          lastModifiedBy: adminId
        })
      }

      // Log bulk admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'bulk_update_suppliers',
        targetSupplierIds: supplierIds,
        updates,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Bulk updated ${supplierIds.length} suppliers by admin ${adminId}`)
    } catch (error) {
      logger.error('Error bulk updating suppliers:', error)
      throw new Error('Failed to bulk update suppliers')
    }
  }

  // Get supplier statistics
  async getSupplierStats(): Promise<SupplierStats> {
    try {
      const stats: SupplierStats = {
        totalSuppliers: 0,
        approvedSuppliers: 0,
        pendingSuppliers: 0,
        rejectedSuppliers: 0,
        suspendedSuppliers: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalProducts: 0,
        activeCategories: 0,
        newSuppliersThisMonth: 0,
        topPerformingSuppliers: 0
      }

      // Get all suppliers for stats calculation
      const snapshot = await getDocs(this.suppliersCollection)
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminSupplier[]

      // Calculate basic stats
      stats.totalSuppliers = suppliers.length
      stats.approvedSuppliers = suppliers.filter(s => s.status === 'approved').length
      stats.pendingSuppliers = suppliers.filter(s => s.status === 'pending').length
      stats.rejectedSuppliers = suppliers.filter(s => s.status === 'rejected').length
      stats.suspendedSuppliers = suppliers.filter(s => s.status === 'suspended').length

      // Calculate business metrics
      const approvedSuppliers = suppliers.filter(s => s.status === 'approved')
      if (approvedSuppliers.length > 0) {
        stats.totalRevenue = approvedSuppliers.reduce((sum, s) => sum + s.businessMetrics.totalRevenue, 0)
        stats.totalProducts = approvedSuppliers.reduce((sum, s) => sum + s.businessMetrics.totalProducts, 0)
        
        const totalRating = approvedSuppliers.reduce((sum, s) => sum + s.businessMetrics.averageRating, 0)
        stats.averageRating = totalRating / approvedSuppliers.length
      }

      // Calculate unique categories
      const allCategories = suppliers.flatMap(s => s.categories)
      const uniqueCategories = new Set(allCategories)
      stats.activeCategories = uniqueCategories.size

      // Calculate monthly stats
      const now = new Date()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      stats.newSuppliersThisMonth = suppliers.filter(s => 
        s.createdAt && new Date(s.createdAt) >= monthAgo
      ).length

      // Calculate top performing suppliers (those with high ratings and revenue)
      stats.topPerformingSuppliers = suppliers.filter(s => 
        s.status === 'approved' && 
        s.businessMetrics.averageRating >= 4.5 && 
        s.businessMetrics.totalRevenue >= 10000
      ).length

      return stats
    } catch (error) {
      logger.error('Error fetching supplier stats:', error)
      throw new Error('Failed to fetch supplier statistics')
    }
  }

  // Subscribe to real-time supplier updates
  subscribeToSuppliers(
    filters: SupplierFilters = {},
    callback: (suppliers: AdminSupplier[]) => void
  ): () => void {
    try {
      let q = query(this.suppliersCollection, orderBy('createdAt', 'desc'))
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters.approvalStatus) {
        q = query(q, where('approvalStatus', '==', filters.approvalStatus))
      }
      
      if (filters.businessType) {
        q = query(q, where('businessType', '==', filters.businessType))
      }
      
      if (filters.category) {
        q = query(q, where('categories', 'array-contains', filters.category))
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let suppliers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminSupplier[]

        // Apply additional filters
        if (filters.verificationStatus) {
          suppliers = suppliers.filter(s => {
            const isVerified = s.verificationStatus.emailVerified && 
                             s.verificationStatus.phoneVerified && 
                             s.verificationStatus.documentsVerified
            return filters.verificationStatus === 'verified' ? isVerified : !isVerified
          })
        }
        
        if (filters.dateRange?.start && filters.dateRange?.end) {
          suppliers = suppliers.filter(s => {
            const submitDate = new Date(s.submittedAt)
            return submitDate >= filters.dateRange!.start && submitDate <= filters.dateRange!.end
          })
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          suppliers = suppliers.filter(s => 
            s.businessName.toLowerCase().includes(searchLower) ||
            s.ownerName.toLowerCase().includes(searchLower) ||
            s.ownerEmail.toLowerCase().includes(searchLower)
          )
        }

        callback(suppliers)
      }, (error) => {
        logger.error('Error in supplier subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up supplier subscription:', error)
      return () => {}
    }
  }

  // Subscribe to real-time supplier stats
  subscribeToSupplierStats(callback: (stats: SupplierStats) => void): () => void {
    try {
      const unsubscribe = onSnapshot(this.suppliersCollection, async () => {
        const stats = await this.getSupplierStats()
        callback(stats)
      }, (error) => {
        logger.error('Error in supplier stats subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up supplier stats subscription:', error)
      return () => {}
    }
  }
}
