import { getFirestore, doc, setDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface AuditLog {
  id?: string
  action: string
  userId: string
  userEmail: string
  userRole: string
  targetId?: string
  targetType?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

export interface AuditFilter {
  action?: string
  userId?: string
  userRole?: string
  targetType?: string
  startDate?: Date
  endDate?: Date
  success?: boolean
  limit?: number
}

export class AuditService {
  private collectionName = 'audit_logs'

  /**
   * Log an audit event
   */
  async logEvent(auditData: Omit<AuditLog, 'timestamp'>): Promise<void> {
    try {
      if (!auditData.action || !auditData.userId || !auditData.userEmail) {
        throw new Error('Missing required audit data: action, userId, userEmail')
      }

      const logEntry: AuditLog = {
        ...auditData,
        timestamp: new Date()
      }

      const logId = `${logEntry.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await setDoc(doc(db, this.collectionName, logId), {
        ...logEntry,
        timestamp: new Date(logEntry.timestamp)
      })
      
      console.log(`📝 Audit logged: ${auditData.action} by ${auditData.userEmail}`)
    } catch (error) {
      console.error('❌ Failed to log audit event:', error)
      // Don't throw error as audit logging shouldn't break main functionality
    }
  }

  /**
   * Log admin action
   */
  async logAdminAction(
    adminId: string,
    adminEmail: string,
    action: string,
    targetId?: string,
    targetType?: string,
    details: Record<string, any> = {},
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!adminId || !adminEmail || !action) {
      throw new Error('Missing required parameters for admin action logging')
    }

    await this.logEvent({
      action,
      userId: adminId,
      userEmail: adminEmail,
      userRole: 'admin',
      targetId,
      targetType,
      details,
      success,
      errorMessage
    })
  }

  /**
   * Log user authentication events
   */
  async logAuthEvent(
    userId: string,
    userEmail: string,
    userRole: string,
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'account_suspended' | 'account_reactivated',
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!userId || !userEmail || !userRole || !action) {
      throw new Error('Missing required parameters for auth event logging')
    }

    await this.logEvent({
      action,
      userId,
      userEmail,
      userRole,
      details: { authEvent: true },
      success,
      errorMessage
    })
  }

  /**
   * Log supplier approval/rejection
   */
  async logSupplierApproval(
    adminId: string,
    adminEmail: string,
    supplierId: string,
    supplierEmail: string,
    action: 'approve' | 'reject',
    reason?: string,
    success: boolean = true
  ): Promise<void> {
    if (!adminId || !adminEmail || !supplierId || !supplierEmail || !action) {
      throw new Error('Missing required parameters for supplier approval logging')
    }

    await this.logEvent({
      action: `supplier_${action}`,
      userId: adminId,
      userEmail: adminEmail,
      userRole: 'admin',
      targetId: supplierId,
      targetType: 'supplier',
      details: {
        supplierEmail,
        reason: reason || '',
        action
      },
      success
    })
  }

  /**
   * Log user management actions
   */
  async logUserManagement(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    action: 'suspend' | 'reactivate' | 'delete' | 'create_admin',
    reason?: string,
    success: boolean = true
  ): Promise<void> {
    if (!adminId || !adminEmail || !targetUserId || !targetUserEmail || !action) {
      throw new Error('Missing required parameters for user management logging')
    }

    await this.logEvent({
      action: `user_${action}`,
      userId: adminId,
      userEmail: adminEmail,
      userRole: 'admin',
      targetId: targetUserId,
      targetType: 'user',
      details: {
        targetUserEmail,
        reason: reason || '',
        action
      },
      success
    })
  }

  /**
   * Log product management actions
   */
  async logProductManagement(
    userId: string,
    userEmail: string,
    userRole: string,
    productId: string,
    action: 'create' | 'update' | 'delete' | 'approve' | 'reject',
    productName: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!userId || !userEmail || !userRole || !productId || !action || !productName) {
      throw new Error('Missing required parameters for product management logging')
    }

    await this.logEvent({
      action: `product_${action}`,
      userId,
      userEmail,
      userRole,
      targetId: productId,
      targetType: 'product',
      details: {
        productName,
        action
      },
      success,
      errorMessage
    })
  }

  /**
   * Log system events
   */
  async logSystemEvent(
    action: string,
    details: Record<string, any> = {},
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!action) {
      throw new Error('Action is required for system event logging')
    }

    await this.logEvent({
      action: `system_${action}`,
      userId: 'system',
      userEmail: 'system@nubiago.com',
      userRole: 'system',
      details,
      success,
      errorMessage
    })
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filter: AuditFilter = {}): Promise<AuditLog[]> {
    try {
      let q = query(collection(db, this.collectionName))

      // Apply filters
      if (filter.action) {
        q = query(q, where('action', '==', filter.action))
      }

      if (filter.userId) {
        q = query(q, where('userId', '==', filter.userId))
      }

      if (filter.userRole) {
        q = query(q, where('userRole', '==', filter.userRole))
      }

      if (filter.targetType) {
        q = query(q, where('targetType', '==', filter.targetType))
      }

      if (filter.success !== undefined) {
        q = query(q, where('success', '==', filter.success))
      }

      // Order by timestamp (newest first)
      q = query(q, orderBy('timestamp', 'desc'))

      // Apply limit
      if (filter.limit) {
        q = query(q, limit(filter.limit))
      }

      const querySnapshot = await getDocs(q)
      const logs: AuditLog[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        logs.push({
          id: doc.id,
          action: data.action,
          userId: data.userId,
          userEmail: data.userEmail,
          userRole: data.userRole,
          targetId: data.targetId,
          targetType: data.targetType,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: data.timestamp?.toDate() || new Date(),
          success: data.success,
          errorMessage: data.errorMessage
        })
      })

      // Apply date filters if provided
      let filteredLogs = logs
      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!)
      }
      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!)
      }

      return filteredLogs
    } catch (error) {
      console.error('❌ Failed to get audit logs:', error)
      throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get user-specific audit logs
   */
  async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return this.getAuditLogs({ userId, limit })
  }

  /**
   * Get admin audit logs
   */
  async getAdminAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.getAuditLogs({ 
      userRole: 'admin', 
      limit 
    })
  }

  /**
   * Get failed audit logs
   */
  async getFailedAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ 
      success: false, 
      limit 
    })
  }

  /**
   * Get recent system events
   */
  async getRecentSystemEvents(limit: number = 20): Promise<AuditLog[]> {
    return this.getAuditLogs({ 
      userRole: 'system', 
      limit 
    })
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const logs = await this.getAuditLogs({ startDate, endDate })

      if (format === 'csv') {
        return this.convertToCSV(logs)
      }

      return JSON.stringify(logs, null, 2)
    } catch (error) {
      console.error('❌ Failed to export audit logs:', error)
      throw new Error(`Failed to export audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Convert logs to CSV format
   */
  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID',
      'Action',
      'User ID',
      'User Email',
      'User Role',
      'Target ID',
      'Target Type',
      'IP Address',
      'User Agent',
      'Timestamp',
      'Success',
      'Error Message',
      'Details'
    ]

    const rows = logs.map(log => [
      log.id || '',
      log.action,
      log.userId,
      log.userEmail,
      log.userRole,
      log.targetId || '',
      log.targetType || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.timestamp.toISOString(),
      log.success ? 'true' : 'false',
      log.errorMessage || '',
      JSON.stringify(log.details)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const oldLogs = await this.getAuditLogs({ 
        endDate: cutoffDate,
        limit: 1000 // Process in batches
      })

      // Delete old logs (this would need to be implemented with proper batch deletion)
      console.log(`🗑️ Found ${oldLogs.length} old audit logs to clean up`)
      
      // In a real implementation, you would delete these logs
      // For now, we'll just log the cleanup action
      await this.logSystemEvent('cleanup_old_logs', {
        logsProcessed: oldLogs.length,
        retentionDays,
        cutoffDate: cutoffDate.toISOString()
      })
    } catch (error) {
      console.error('❌ Failed to cleanup old logs:', error)
      throw new Error(`Failed to cleanup old logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(days: number = 30): Promise<{
    totalEvents: number
    successfulEvents: number
    failedEvents: number
    topActions: Array<{ action: string; count: number }>
    topUsers: Array<{ userId: string; count: number }>
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const logs = await this.getAuditLogs({ startDate })

      const totalEvents = logs.length
      const successfulEvents = logs.filter(log => log.success).length
      const failedEvents = totalEvents - successfulEvents

      // Count actions
      const actionCounts = new Map<string, number>()
      logs.forEach(log => {
        const count = actionCounts.get(log.action) || 0
        actionCounts.set(log.action, count + 1)
      })

      const topActions = Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Count users
      const userCounts = new Map<string, number>()
      logs.forEach(log => {
        const count = userCounts.get(log.userId) || 0
        userCounts.set(log.userId, count + 1)
      })

      const topUsers = Array.from(userCounts.entries())
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalEvents,
        successfulEvents,
        failedEvents,
        topActions,
        topUsers
      }
    } catch (error) {
      console.error('❌ Failed to get audit stats:', error)
      throw new Error(`Failed to get audit stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const auditService = new AuditService() 
