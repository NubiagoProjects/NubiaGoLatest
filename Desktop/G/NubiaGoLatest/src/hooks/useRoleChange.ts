import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/services/auth.service'
import { User } from '@/types'

interface UseRoleChangeOptions {
  uid?: string
  onRoleChange?: (user: User | null) => void
  onError?: (error: string) => void
}

export function useRoleChange(options: UseRoleChangeOptions = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set up real-time listener for user changes
  useEffect(() => {
    if (!options.uid) return

    const unsubscribe = authService.onUserChangeWithRoleHandling(
      options.uid,
      (updatedUser) => {
        setUser(updatedUser)
        if (options.onRoleChange) {
          options.onRoleChange(updatedUser)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [options.uid, options.onRoleChange])

  // Function to change user role
  const changeRole = useCallback(async (
    newRole: 'customer' | 'supplier' | 'admin',
    newStatus: 'active' | 'suspended' | 'pending',
    reason?: string
  ) => {
    if (!options.uid) {
      setError('No user ID provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/role-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: options.uid,
          newRole,
          newStatus,
          reason
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role')
      }

      // The real-time listener will automatically update the user state
      if (options.onRoleChange) {
        options.onRoleChange(user)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update user role'
      setError(errorMessage)
      if (options.onError) {
        options.onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [options.uid, user, options.onRoleChange, options.onError])

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    if (!options.uid) return

    setLoading(true)
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser && currentUser.uid === options.uid) {
        setUser(currentUser)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [options.uid])

  return {
    user,
    loading,
    error,
    changeRole,
    refreshUser,
    clearError: () => setError(null)
  }
} 
