'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/services/auth.service'
import { User } from '@/types'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  register: (email: string, password: string, displayName?: string, role?: 'customer' | 'supplier') => Promise<void>
  resendVerification: () => Promise<void>
  checkEmailVerification: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
      setError(null)
    })

    return () => {
      unsubscribe()
      authService.cleanupListeners()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await authService.signIn(email, password)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string, role: 'customer' | 'supplier' = 'customer') => {
    setLoading(true)
    setError(null)
    try {
      await authService.register(email, password, displayName, role)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const resendVerification = useCallback(async () => {
    setError(null)
    try {
      await authService.resendEmailVerification()
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  const checkEmailVerification = useCallback(async (): Promise<boolean> => {
    try {
      return await authService.checkEmailVerification()
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }, [])

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    register,
    resendVerification,
    checkEmailVerification
  }
} 
