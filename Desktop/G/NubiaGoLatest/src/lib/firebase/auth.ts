// Firebase Authentication Service
// Optimized imports to reduce bundle size

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  User,
  Auth
} from 'firebase/auth'

import { auth as existingAuth } from './config'
import { handleAsync, createErrorResponse, createSuccessResponse } from '@/lib/utils/standardized-error-handler'

// Use existing Firebase auth instance
export const getFirebaseAuth = () => {
  return existingAuth
}

// Authentication functions
export const signInUser = async (email: string, password: string) => {
  return handleAsync(async () => {
    const auth = getFirebaseAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  }, { operation: 'signInUser', email })
}

export const createUser = async (email: string, password: string, displayName?: string) => {
  return handleAsync(async () => {
    const auth = getFirebaseAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
    }
    
    return { user: userCredential.user, error: null }
  }, { operation: 'createUser', email, displayName })
}

export const signOutUser = async () => {
  return handleAsync(async () => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    return { success: true, error: null }
  }, { operation: 'signOutUser' })
}

export const resetPassword = async (email: string) => {
  return handleAsync(async () => {
    const auth = getFirebaseAuth()
    await sendPasswordResetEmail(auth, email)
    return { success: true, error: null }
  }, { operation: 'resetPassword', email })
}

export const confirmPasswordResetCode = async (code: string, newPassword: string) => {
  return handleAsync(async () => {
    const auth = getFirebaseAuth()
    await confirmPasswordReset(auth, code, newPassword)
    return { success: true, error: null }
  }, { operation: 'confirmPasswordResetCode' })
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

// Export types
export type { User, Auth }
