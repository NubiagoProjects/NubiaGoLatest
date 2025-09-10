'use client'

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  AuthError,
  UserCredential
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './config'

// User profile interface
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  photoURL?: string
  emailVerified: boolean
  role: 'customer' | 'supplier' | 'admin'
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  preferences?: {
    notifications: boolean
    marketing: boolean
    language: string
    currency: string
  }
  provider: 'email' | 'google' | 'facebook'
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

// OAuth provider instances
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

// Configure providers
googleProvider.addScope('email')
googleProvider.addScope('profile')

facebookProvider.addScope('email')
facebookProvider.addScope('public_profile')

class AuthService {
  private authStateListeners: ((user: UserProfile | null) => void)[] = []

  // Initialize auth state listener
  constructor() {
    onAuthStateChanged(auth, this.handleAuthStateChange.bind(this))
  }

  private async handleAuthStateChange(firebaseUser: FirebaseUser | null) {
    if (firebaseUser) {
      try {
        const userProfile = await this.getUserProfile(firebaseUser.uid)
        if (userProfile) {
          // Update last login
          await this.updateLastLogin(firebaseUser.uid)
          this.notifyAuthStateListeners(userProfile)
        } else {
          // Create profile if it doesn't exist (for OAuth users)
          const profile = await this.createUserProfileFromFirebaseUser(firebaseUser)
          this.notifyAuthStateListeners(profile)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        this.notifyAuthStateListeners(null)
      }
    } else {
      this.notifyAuthStateListeners(null)
    }
  }

  private notifyAuthStateListeners(user: UserProfile | null) {
    this.authStateListeners.forEach(listener => listener(user))
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(callback)
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userProfile = await this.getUserProfile(userCredential.user.uid)
      
      if (!userProfile) {
        throw new Error('User profile not found')
      }

      await this.updateLastLogin(userCredential.user.uid)
      return userProfile
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Email/Password Registration
  async registerWithEmail(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    role: 'customer' | 'supplier' = 'customer',
    phone?: string
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update Firebase user profile
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      })

      // Send email verification
      await sendEmailVerification(userCredential.user)

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        photoURL: userCredential.user.photoURL || undefined,
        emailVerified: userCredential.user.emailVerified,
        role,
        phone,
        provider: 'email',
        preferences: {
          notifications: true,
          marketing: false,
          language: 'en',
          currency: 'USD'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile)
      return userProfile
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return await this.handleOAuthResult(result, 'google')
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Facebook Sign In
  async signInWithFacebook(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      return await this.handleOAuthResult(result, 'facebook')
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Handle OAuth result
  private async handleOAuthResult(
    result: UserCredential, 
    provider: 'google' | 'facebook'
  ): Promise<UserProfile> {
    const firebaseUser = result.user
    
    // Check if user profile already exists
    let userProfile = await this.getUserProfile(firebaseUser.uid)
    
    if (!userProfile) {
      // Create new user profile
      userProfile = await this.createUserProfileFromFirebaseUser(firebaseUser, provider)
    } else {
      // Update last login
      await this.updateLastLogin(firebaseUser.uid)
    }

    return userProfile
  }

  // Create user profile from Firebase user (for OAuth)
  private async createUserProfileFromFirebaseUser(
    firebaseUser: FirebaseUser,
    provider: 'email' | 'google' | 'facebook' = 'email'
  ): Promise<UserProfile> {
    const displayName = firebaseUser.displayName || 'User'
    const nameParts = displayName.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || ''

    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      firstName,
      lastName,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      role: 'customer', // Default role
      provider,
      preferences: {
        notifications: true,
        marketing: false,
        language: 'en',
        currency: 'USD'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile)
    return userProfile
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update last login timestamp
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!auth.currentUser
  }

  // Handle auth errors
  private handleAuthError(error: AuthError): Error {
    console.error('Auth error:', error)
    
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('No account found with this email address.')
      case 'auth/wrong-password':
        return new Error('Incorrect password.')
      case 'auth/email-already-in-use':
        return new Error('An account already exists with this email address.')
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters.')
      case 'auth/invalid-email':
        return new Error('Invalid email address.')
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.')
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in popup was closed before completion. Please try again or use email/password sign-in.')
      case 'auth/popup-blocked':
        return new Error('Sign-in popup was blocked by your browser. Please allow popups for this site or use email/password sign-in.')
      case 'auth/cancelled-popup-request':
        return new Error('Sign-in was cancelled. You can try again or use email/password sign-in instead.')
      case 'auth/account-exists-with-different-credential':
        return new Error('An account already exists with the same email address but different sign-in credentials. Please use email/password sign-in.')
      case 'auth/network-request-failed':
        return new Error('Network error occurred. Please check your internet connection and try again.')
      case 'auth/operation-not-allowed':
        return new Error('This sign-in method is not enabled. Please contact support or use email/password sign-in.')
      case 'auth/requires-recent-login':
        return new Error('This operation requires recent authentication. Please sign in again.')
      default:
        return new Error(error.message || 'An authentication error occurred.')
    }
  }

  // Clean up listeners
  cleanupListeners(): void {
    this.authStateListeners = []
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
