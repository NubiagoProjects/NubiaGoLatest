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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { User } from '@/types/common'
import { logger } from '@/lib/utils/logger'

export interface AdminUser extends Omit<User, 'id'> {
  uid: string;
  name?: string;
  email: string;
  role: 'customer' | 'supplier' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  phoneNumber?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  loginCount?: number;
  isOnline?: boolean;
  deviceInfo?: {
    userAgent: string;
    ipAddress?: string;
    lastSeen: Date;
  };
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  totalSuppliers: number
  totalAdmins: number
  totalCustomers: number
  newUsersThisMonth: number
  activeUsersThisWeek: number
}

export interface UserFilters {
  role?: 'customer' | 'supplier' | 'admin'
  status?: 'active' | 'pending' | 'suspended'
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export class AdminUserService {
  private usersCollection = collection(db, 'users')
  private adminActionsCollection = collection(db, 'admin_actions')

  // Get all users with pagination and filters
  async getUsers(
    filters: UserFilters = {},
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{ users: AdminUser[]; lastDoc: any; hasMore: boolean }> {
    try {
      let q = query(this.usersCollection, orderBy('createdAt', 'desc'), limit(pageSize))
      
      // Apply filters
      if (filters.role) {
        q = query(q, where('role', '==', filters.role))
      }
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUser[]

      const hasMore = snapshot.docs.length === pageSize
      const lastVisible = snapshot.docs[snapshot.docs.length - 1]

      return { users, lastDoc: lastVisible, hasMore }
    } catch (error) {
      logger.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  }

  // Get user by ID
  async getUserById(uid: string): Promise<AdminUser | null> {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        uid: docSnap.id,
        ...docSnap.data()
      } as AdminUser
    } catch (error) {
      logger.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  // Update user role and status
  async updateUserRole(
    uid: string, 
    newRole: 'customer' | 'supplier' | 'admin',
    newStatus: 'active' | 'pending' | 'suspended',
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update user document
      const userRef = doc(db, 'users', uid)
      batch.update(userRef, {
        role: newRole,
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId,
        lastModifiedAt: serverTimestamp()
      })

      // Log admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'update_user_role',
        targetUserId: uid,
        oldRole: (await this.getUserById(uid))?.role,
        newRole,
        oldStatus: (await this.getUserById(uid))?.status,
        newStatus,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`User ${uid} role updated to ${newRole} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  // Bulk update users
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<AdminUser>,
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update each user
      for (const uid of userIds) {
        const userRef = doc(db, 'users', uid)
        batch.update(userRef, {
          ...updates,
          updatedAt: serverTimestamp(),
          lastModifiedBy: adminId,
          lastModifiedAt: serverTimestamp()
        })
      }

      // Log bulk admin action
      const actionRef = doc(this.adminActionsCollection)
      batch.set(actionRef, {
        adminId,
        action: 'bulk_update_users',
        targetUserIds: userIds,
        updates,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`Bulk updated ${userIds.length} users by admin ${adminId}`)
    } catch (error) {
      logger.error('Error bulk updating users:', error)
      throw new Error('Failed to bulk update users')
    }
  }

  // Delete user (soft delete)
  async deleteUser(uid: string, adminId: string, reason?: string): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Soft delete user
      const userRef = doc(db, 'users', uid)
      batch.update(userRef, {
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
        action: 'delete_user',
        targetUserId: uid,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`User ${uid} deleted by admin ${adminId}`)
    } catch (error) {
      logger.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const stats: UserStats = {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0,
        totalSuppliers: 0,
        totalAdmins: 0,
        totalCustomers: 0,
        newUsersThisMonth: 0,
        activeUsersThisWeek: 0
      }

      // Get all users for stats calculation
      const snapshot = await getDocs(this.usersCollection)
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUser[]

      // Calculate stats
      stats.totalUsers = users.length
      stats.activeUsers = users.filter(u => u.status === 'active').length
      stats.pendingUsers = users.filter(u => u.status === 'pending').length
      stats.suspendedUsers = users.filter(u => u.status === 'suspended').length
      stats.totalSuppliers = users.filter(u => u.role === 'supplier').length
      stats.totalAdmins = users.filter(u => u.role === 'admin').length
      stats.totalCustomers = users.filter(u => u.role === 'customer').length

      // Calculate monthly and weekly stats
      const now = new Date()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      stats.newUsersThisMonth = users.filter(u => 
        u.createdAt && new Date(u.createdAt) >= monthAgo
      ).length

      stats.activeUsersThisWeek = users.filter(u => 
        u.lastLoginAt && new Date(u.lastLoginAt) >= weekAgo
      ).length

      return stats
    } catch (error) {
      logger.error('Error fetching user stats:', error)
      throw new Error('Failed to fetch user statistics')
    }
  }

  // Subscribe to real-time user updates
  subscribeToUsers(
    filters: UserFilters = {},
    callback: (users: AdminUser[]) => void
  ): () => void {
    try {
      let q = query(this.usersCollection, orderBy('createdAt', 'desc'))
      
      if (filters.role) {
        q = query(q, where('role', '==', filters.role))
      }
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as AdminUser[]

        // Apply search filter if specified
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          const filteredUsers = users.filter(user => 
            user.name?.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.uid.toLowerCase().includes(searchLower)
          )
          callback(filteredUsers)
        } else {
          callback(users)
        }
      }, (error) => {
        logger.error('Error in user subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up user subscription:', error)
      return () => {}
    }
  }

  // Subscribe to real-time user stats
  subscribeToUserStats(callback: (stats: UserStats) => void): () => void {
    try {
      const unsubscribe = onSnapshot(this.usersCollection, async () => {
        const stats = await this.getUserStats()
        callback(stats)
      }, (error) => {
        logger.error('Error in user stats subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error setting up user stats subscription:', error)
      return () => {}
    }
  }
}
