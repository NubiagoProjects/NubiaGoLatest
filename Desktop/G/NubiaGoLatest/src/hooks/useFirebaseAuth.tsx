'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { logger } from '@/lib/utils/logger'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserCredential>
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    }, (error) => {
      logger.error('Auth state change error:', error)
      setError('Authentication error occurred')
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result
    } catch (error: any) {
      logger.error('Sign in error:', error)
      let errorMessage = 'Sign in failed'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later'
          break
        case 'auth/internal-error':
          errorMessage = 'Authentication service error. Please try again'
          break
        default:
          errorMessage = error.message || 'Sign in failed'
      }
      
      setError(errorMessage)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }
      
      return result
    } catch (error: any) {
      logger.error('Sign up error:', error)
      let errorMessage = 'Account creation failed'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists'
          break
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Use at least 6 characters'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/internal-error':
          errorMessage = 'Authentication service error. Please try again'
          break
        default:
          errorMessage = error.message || 'Account creation failed'
      }
      
      setError(errorMessage)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut(auth)
    } catch (error: any) {
      logger.error('Sign out error:', error)
      setError('Sign out failed')
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      logger.error('Password reset error:', error)
      let errorMessage = 'Password reset failed'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        default:
          errorMessage = error.message || 'Password reset failed'
      }
      
      setError(errorMessage)
      throw error
    }
  }

  const updateUserProfile = async (displayName: string) => {
    try {
      setError(null)
      if (user) {
        await updateProfile(user, { displayName })
      }
    } catch (error: any) {
      logger.error('Profile update error:', error)
      setError('Profile update failed')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      // Add custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      return result
    } catch (error: any) {
      logger.error('Google sign in error:', error)
      let errorMessage = 'Google sign in failed'
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled'
          break
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site'
          break
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method'
          break
        default:
          errorMessage = error.message || 'Google sign in failed'
      }
      
      setError(errorMessage)
      throw error
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
  }
  return context
}
