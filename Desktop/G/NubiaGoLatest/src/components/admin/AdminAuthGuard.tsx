'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@/types'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface AdminAuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin'
  fallback?: React.ReactNode
}

export default function AdminAuthGuard({ 
  children, 
  requiredRole = 'admin',
  fallback 
}: AdminAuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push('/auth/login?redirect=/admin')
        return
      }

      if (user.role !== 'admin') {
        // User exists but not admin, redirect to unauthorized
        router.push('/unauthorized')
        return
      }

      if (!user.isVerified) {
        // User is not verified, redirect to account suspended
        router.push('/account-suspended')
        return
      }

      // User is authorized
      setIsAuthorized(true)
      setCheckingAuth(false)
    }
  }, [user, loading, router, requiredRole])

  // Show loading while checking authentication
  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show fallback or default unauthorized message
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this admin area. Please contact your system administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
