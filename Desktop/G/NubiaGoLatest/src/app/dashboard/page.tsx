'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BarChart3, Users, Building, Shield } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useFirebaseAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/login')
        return
      }

      // For now, default to customer dashboard
      // In a real app, you'd get the role from custom claims or user profile
      router.push('/customer')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
              <div className="w-16 h-16 bg-white rounded-2xl animate-spin"></div>
            </div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-primary-600 border-r-secondary-600 rounded-3xl animate-spin mx-auto"></div>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Loading Dashboard...
          </h2>
          <p className="text-xl text-gray-600">Please wait while we load your enterprise dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-16 h-16 bg-white rounded-2xl animate-spin"></div>
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-primary-600 border-r-secondary-600 rounded-3xl animate-spin mx-auto"></div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
          Redirecting to Dashboard...
        </h2>
        <p className="text-xl text-gray-600 mb-8">Preparing your enterprise dashboard experience</p>
        
        {/* Premium Dashboard Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customer Dashboard</h3>
            <p className="text-sm text-gray-600">Manage orders & preferences</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Supplier Dashboard</h3>
            <p className="text-sm text-gray-600">Manage products & sales</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
            <p className="text-sm text-gray-600">Platform management</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
