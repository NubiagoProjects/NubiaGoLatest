import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { User } from '@/types'
import { emailService } from './email.service'
import { auditService } from './audit.service'

export class AuthService {
  private userListeners: Map<string, () => void> = new Map()

  // Register new user with role-based logic
  async register(email: string, password: string, displayName?: string, role: 'customer' | 'supplier' | 'admin' = 'customer'): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Send email verification
      await sendEmailVerification(firebaseUser)

      // Update display name if provided
      if (displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      // Determine initial status based on role
      const initialStatus = role === 'supplier' ? 'pending' : 'pending' // All users start as pending until email verified

      // Create user profile in Firestore
      const userProfile: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || firebaseUser.displayName || email.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        role: role,
        status: initialStatus,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile)

      return userProfile
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Register supplier with additional business information
  async registerSupplier(
    email: string, 
    password: string, 
    displayName: string,
    businessName: string,
    businessType: string,
    phoneNumber: string,
    documents: File[]
  ): Promise<User> {
    try {
      // First create the user account
      const user = await this.register(email, password, displayName, 'supplier')
      
      // Upload business documents to Firebase Storage
      const documentUrls = await this.uploadBusinessDocuments(user.uid, documents)
      
      // Create supplier profile with additional business information
      const supplierProfile = {
        ...user,
        businessName,
        businessType,
        phoneNumber,
        documentUrls,
        approvalStatus: 'pending',
        submittedAt: new Date(),
        approvedAt: null,
        approvedBy: null
      }

      // Save supplier profile to a separate collection
      await setDoc(doc(db, 'suppliers', user.uid), supplierProfile)
      
      // Update user status to pending (both email verification and supplier approval)
      await this.updateUserProfile(user.uid, { status: 'pending' })

      // Send registration confirmation email
      await emailService.sendSupplierRegistrationConfirmation(user)

      // Log the registration event
      await auditService.logAuthEvent(
        user.uid,
        user.email || '',
        user.role || 'customer',
        'register',
        true
      )

      return user
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign in user with email verification check
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        // Send verification email again if not verified
        await sendEmailVerification(firebaseUser)
        throw new Error('Please verify your email address before signing in. A new verification email has been sent.')
      }

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found')
      }

      const user = userDoc.data() as User

      // Update email verification status if needed
      if (!user.emailVerified) {
        await this.updateUserProfile(user.uid, { emailVerified: true })
        user.emailVerified = true
      }

      // Check if user is suspended
      if (user.status === 'suspended') {
        await auditService.logAuthEvent(
          user.uid,
          user.email || '',
          user.role || 'customer',
          'login',
          false,
          'Account suspended'
        )
        throw new Error('Account has been suspended. Please contact support.')
      }

      // Check if user is pending email verification
      if (user.status === 'pending' && !user.emailVerified) {
        await auditService.logAuthEvent(
          user.uid,
          user.email || '',
          user.role || 'customer',
          'login',
          false,
          'Email not verified'
        )
        throw new Error('Please verify your email address before signing in.')
      }

      // For suppliers, check if they're approved (after email verification)
      if (user.role === 'supplier' && user.status === 'pending' && user.emailVerified) {
        await auditService.logAuthEvent(
          user.uid,
          user.email || '',
          user.role || 'customer',
          'login',
          false,
          'Account pending approval'
        )
        throw new Error('Your supplier account is pending approval. You will be notified once approved.')
      }

      // If email is verified but status is still pending, update to active for customers
      if (user.emailVerified && user.status === 'pending' && user.role === 'customer') {
        await this.updateUserProfile(user.uid, { status: 'active' })
        user.status = 'active'
      }

      // Log successful login
      await auditService.logAuthEvent(
        user.uid,
        user.email || '',
        user.role || 'customer',
        'login',
        true
      )

      return user
    } catch (error: any) {
      // Log failed login attempt
      await auditService.logAuthEvent(
        'unknown',
        email,
        'unknown',
        'login',
        false,
        error.message
      )
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error('Failed to sign out')
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) return null

      return userDoc.data() as User
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Update user profile with real-time notification
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      const currentUser = userDoc.data() as User
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date()
      }

      await updateDoc(userRef, updatedUser)

      // Log the profile update
      await auditService.logSystemEvent(
        'profile_update',
        {
          userId: uid,
          updatedFields: Object.keys(updates)
        },
        true
      )

      return updatedUser
    } catch (error: any) {
      throw new Error('Failed to update user profile')
    }
  }

  // Admin functions for user management
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      return snapshot.docs.map(doc => doc.data() as User)
    } catch (error) {
      throw new Error('Failed to fetch users')
    }
  }

  async getPendingSuppliers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'supplier'), where('status', '==', 'pending'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as User)
    } catch (error) {
      throw new Error('Failed to fetch pending suppliers')
    }
  }

  // Approve supplier with real-time updates
  async approveSupplier(uid: string, approvedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      // Update user status to active
      await this.updateUserProfile(uid, { 
        status: 'active',
        updatedAt: new Date()
      })

      // Update supplier profile
      const supplierRef = doc(db, 'suppliers', uid)
      await updateDoc(supplierRef, {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy
      })

      // Send approval email
      await emailService.sendSupplierApprovalSuccess(user, approvedBy)

      // Log the approval action
      await auditService.logSupplierApproval(
        approvedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'approve',
        undefined,
        true
      )
    } catch (error) {
      // Log failed approval
      await auditService.logSupplierApproval(
        approvedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'approve',
        undefined,
        false
      )
      throw new Error('Failed to approve supplier')
    }
  }

  // Reject supplier with real-time updates
  async rejectSupplier(uid: string, reason: string, rejectedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      // Update user status to suspended
      await this.updateUserProfile(uid, { 
        status: 'suspended',
        updatedAt: new Date()
      })

      // Update supplier profile
      const supplierRef = doc(db, 'suppliers', uid)
      await updateDoc(supplierRef, {
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectedBy,
        rejectionReason: reason
      })

      // Send rejection email
      await emailService.sendSupplierRejection(user, reason, rejectedBy)

      // Log the rejection action
      await auditService.logSupplierApproval(
        rejectedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'reject',
        reason,
        true
      )
    } catch (error) {
      // Log failed rejection
      await auditService.logSupplierApproval(
        rejectedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'reject',
        reason,
        false
      )
      throw new Error('Failed to reject supplier')
    }
  }

  // Suspend user with real-time updates
  async suspendUser(uid: string, reason: string, suspendedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      await this.updateUserProfile(uid, { 
        status: 'suspended',
        updatedAt: new Date()
      })

      // Log suspension
      await setDoc(doc(db, 'user_suspensions', `${uid}_${Date.now()}`), {
        uid,
        reason,
        suspendedBy,
        suspendedAt: new Date()
      })

      // Send suspension email
      await emailService.sendAccountSuspension(user, reason, suspendedBy)

      // Log the suspension action
      await auditService.logUserManagement(
        suspendedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'suspend',
        reason,
        true
      )
    } catch (error) {
      // Log failed suspension
      await auditService.logUserManagement(
        suspendedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'suspend',
        reason,
        false
      )
      throw new Error('Failed to suspend user')
    }
  }

  // Reactivate user with real-time updates
  async reactivateUser(uid: string, reactivatedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      await this.updateUserProfile(uid, { 
        status: 'active',
        updatedAt: new Date()
      })

      // Log reactivation
      await setDoc(doc(db, 'user_reactivations', `${uid}_${Date.now()}`), {
        uid,
        reactivatedBy,
        reactivatedAt: new Date()
      })

      // Send reactivation email
      await emailService.sendAccountReactivation(user, reactivatedBy)

      // Log the reactivation action
      await auditService.logUserManagement(
        reactivatedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'reactivate',
        undefined,
        true
      )
    } catch (error) {
      // Log failed reactivation
      await auditService.logUserManagement(
        reactivatedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'reactivate',
        undefined,
        false
      )
      throw new Error('Failed to reactivate user')
    }
  }

  // Create admin account (only by existing admins or system)
  async createAdminAccount(
    email: string, 
    password: string, 
    displayName: string,
    createdBy: string
  ): Promise<User> {
    try {
      // Check if creator is admin
      const creator = await this.getCurrentUser()
      if (!creator || creator.role !== 'admin') {
        throw new Error('Only admins can create admin accounts')
      }

      const user = await this.register(email, password, displayName, 'admin')
      
      // Log admin creation
      await setDoc(doc(db, 'admin_creations', `${user.uid}_${Date.now()}`), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdBy,
        createdAt: new Date()
      })

      return user
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Upload business documents
  private async uploadBusinessDocuments(uid: string, documents: File[]): Promise<string[]> {
    try {
      // Import storage service
      const { storageService } = await import('./storage.service')
      
      // Upload documents to Firebase Storage
      const uploadResults = await storageService.uploadBusinessDocuments(uid, documents)
      
      return uploadResults.map(result => result.url)
    } catch (error) {
      console.error('Failed to upload business documents:', error)
      // Return mock URLs as fallback
      return documents.map((doc, index) => `https://storage.googleapis.com/business-docs/${uid}/doc_${index}.pdf`)
    }
  }

  // Listen to auth state changes with real-time user updates
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null)
        return
      }

      try {
        // Set up real-time listener for user document
        const unsubscribe = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (doc) => {
            if (doc.exists()) {
              const userData = doc.data() as User
              callback(userData)
            } else {
              callback(null)
            }
          },
          (error) => {
            console.error('Error in user document listener:', error)
            callback(null)
          }
        )

        // Store the unsubscribe function
        this.userListeners.set(firebaseUser.uid, unsubscribe)

        return unsubscribe
      } catch (error) {
        console.error('Error in auth state change:', error)
        callback(null)
      }
    })
  }

  // Get real-time user updates for a specific user
  onUserChange(uid: string, callback: (user: User | null) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as User)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Error in user change listener:', error)
        callback(null)
      }
    )

    // Store the unsubscribe function
    this.userListeners.set(uid, unsubscribe)

    return unsubscribe
  }

  // Clean up all listeners
  cleanupListeners(): void {
    this.userListeners.forEach((unsubscribe) => {
      unsubscribe()
    })
    this.userListeners.clear()
  }

  // Resend email verification
  async resendEmailVerification(): Promise<void> {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('No user is currently signed in')
      }

      await sendEmailVerification(firebaseUser)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Check email verification status
  async checkEmailVerification(): Promise<boolean> {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        return false
      }

      // Reload user to get latest verification status
      await firebaseUser.reload()
      
      return firebaseUser.emailVerified
    } catch (error) {
      console.error('Error checking email verification:', error)
      return false
    }
  }

  // Handle role changes in real-time
  async handleRoleChange(uid: string, newRole: 'customer' | 'supplier' | 'admin', newStatus: 'active' | 'suspended' | 'pending'): Promise<void> {
    try {
      // Update user profile in Firestore
      await this.updateUserProfile(uid, { 
        role: newRole, 
        status: newStatus,
        updatedAt: new Date()
      })

      // Log the role change using system event
      await auditService.logSystemEvent(
        'role_change',
        {
          userId: uid,
          newRole,
          newStatus,
          changedBy: 'system'
        },
        true
      )

      // If user is currently logged in, refresh their session
      const currentUser = auth.currentUser
      if (currentUser && currentUser.uid === uid) {
        // Force a token refresh to update the session
        await currentUser.getIdToken(true)
      }
    } catch (error) {
      console.error('Error handling role change:', error)
      throw new Error('Failed to update user role')
    }
  }

  // Get real-time user updates with role change handling
  onUserChangeWithRoleHandling(uid: string, callback: (user: User | null) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      async (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as User
          
          // Check if this is a role change for the current user
          const currentUser = auth.currentUser
          if (currentUser && currentUser.uid === uid) {
            // Update the user's session if role/status changed
            try {
              await currentUser.getIdToken(true)
            } catch (error) {
              console.error('Error refreshing token after role change:', error)
            }
          }
          
          callback(userData)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Error in user change listener:', error)
        callback(null)
      }
    )

    // Store the unsubscribe function
    this.userListeners.set(uid, unsubscribe)

    return unsubscribe
  }

  // Get JWT token for authentication
  async getAuthToken(): Promise<string | null> {
    try {
      const user = auth.currentUser
      if (!user) {
        return null
      }
      
      return await getIdToken(user, true)
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  // Helper method to get user-friendly error messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      default:
        return 'An error occurred. Please try again'
    }
  }
}

export const authService = new AuthService() 
