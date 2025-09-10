// Lightweight user service for Edge Runtime
// Uses Firebase client SDK instead of Admin SDK

import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface EdgeUser {
  uid: string
  email: string
  displayName?: string | null
  role?: 'customer' | 'supplier' | 'admin'
  status?: 'active' | 'suspended' | 'pending'
  emailVerified?: boolean
}

export class EdgeUserService {
  /**
   * Get user data from Firestore using client SDK
   */
  static async getUserData(uid: string): Promise<EdgeUser | null> {
    try {
      if (!uid) {
        console.error('User ID is required')
        return null
      }

      // Only initialize Firebase if we're in a browser environment
      if (typeof window === 'undefined') {
        // In Edge Runtime, we can't use Firebase client SDK
        // Return a mock user for now or handle differently
        console.warn('Firebase client SDK not available in Edge Runtime')
        return null
      }

      const userDoc = await getDoc(doc(db, 'users', uid))
      
      if (!userDoc.exists()) {
        console.warn(`User document not found for UID: ${uid}`)
        return null
      }

      const userData = userDoc.data()
      
      return {
        uid,
        email: userData.email || '',
        displayName: userData.displayName || null,
        role: userData.role || 'customer',
        status: userData.status || 'pending',
        emailVerified: userData.emailVerified || false
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  /**
   * Check if user has required role
   */
  static hasRequiredRole(user: EdgeUser, requiredRoles: string[]): boolean {
    if (!user || !user.role) {
      return false
    }
    return requiredRoles.includes(user.role)
  }

  /**
   * Check if user is active
   */
  static isUserActive(user: EdgeUser): boolean {
    if (!user || !user.status) {
      return false
    }
    return user.status === 'active'
  }

  /**
   * Check if user email is verified
   */
  static isEmailVerified(user: EdgeUser): boolean {
    if (!user) {
      return false
    }
    return user.emailVerified === true
  }

  /**
   * Get user status for routing decisions
   */
  static getUserStatus(user: EdgeUser): {
    canAccess: boolean
    redirectTo?: string
    reason?: string
  } {
    // Check if user is suspended
    if (user.status === 'suspended') {
      return {
        canAccess: false,
        redirectTo: '/account-suspended',
        reason: 'Account suspended'
      }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        canAccess: false,
        redirectTo: '/auth/verify-email',
        reason: 'Email not verified'
      }
    }

    // Check if supplier is pending approval
    if (user.role === 'supplier' && user.status === 'pending') {
      return {
        canAccess: false,
        redirectTo: '/supplier/pending',
        reason: 'Supplier account pending approval'
      }
    }

    // User can access
    return {
      canAccess: true
    }
  }

  /**
   * Validate user permissions for specific actions
   */
  static validatePermissions(user: EdgeUser, action: string, resource?: string): {
    allowed: boolean
    reason?: string
  } {
    if (!user) {
      return { allowed: false, reason: 'User not authenticated' }
    }

    if (!this.isUserActive(user)) {
      return { allowed: false, reason: 'Account not active' }
    }

    if (!this.isEmailVerified(user)) {
      return { allowed: false, reason: 'Email not verified' }
    }

    // Admin can do everything
    if (user.role === 'admin') {
      return { allowed: true }
    }

    // Supplier permissions
    if (user.role === 'supplier') {
      const supplierActions = ['manage_products', 'view_orders', 'update_inventory']
      if (supplierActions.includes(action)) {
        return { allowed: true }
      }
    }

    // Customer permissions
    if (user.role === 'customer') {
      const customerActions = ['view_products', 'place_orders', 'manage_profile']
      if (customerActions.includes(action)) {
        return { allowed: true }
      }
    }

    return { allowed: false, reason: 'Insufficient permissions' }
  }
} 
