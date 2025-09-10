'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { ErrorBoundaryProvider } from '@/components/providers/error-boundary-provider'
import { Logo } from '@/components/ui/Logo'
import { ToastProvider } from '@/components/ui/toast'
import { FirebaseAuthProvider } from '@/hooks/useFirebaseAuth'
import { RoleChangeHandler } from '@/components/auth/role-change-handler'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
            <ErrorBoundaryProvider>
      <FirebaseAuthProvider>
        <ToastProvider>
          <RoleChangeHandler>
            <div className="min-h-screen bg-gray-50">
              {/* Simple Header with Homepage Button */}
              <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                      <Logo size="md" />
                      <span className="text-xl font-bold text-gray-900">NubiaGo</span>
                    </div>
                    
                    {/* Return to Homepage Button */}
                    <Link
                      href="/"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      <Home className="h-4 w-4" />
                      <span>Return to Homepage</span>
                    </Link>
                  </div>
                </div>
              </header>
              
              {/* Dashboard Content */}
              <main className="flex-1">
                {children}
              </main>
            </div>
          </RoleChangeHandler>
        </ToastProvider>
      </FirebaseAuthProvider>
            </ErrorBoundaryProvider>
  )
}
