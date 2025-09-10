'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Users, Lock, CheckCircle } from 'lucide-react'
import LoginForm from '@/components/auth/login-form'
import RegisterForm from '@/components/auth/register-form'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const router = useRouter()
  const { user } = useFirebaseAuth()

  // Redirect if already authenticated
  if (user) {
    router.push('/')
    return null
  }

  const handleSuccess = () => {
    router.push('/')
  }

  const handleSwitchToRegister = () => {
    setMode('register')
  }

  const handleSwitchToLogin = () => {
    setMode('login')
  }

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    console.log('Forgot password clicked')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Premium Back to Home Link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Premium Logo/Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
            <Shield className="w-4 h-4 mr-2" />
            Enterprise Authentication
          </div>
          
          <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            NubiaGo
          </h1>
          <p className="text-xl text-gray-600">Your trusted enterprise marketplace</p>
        </div>

        {/* Premium Auth Container */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 lg:p-12">
          {/* Premium Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
              <p className="text-sm text-gray-600">Bank-level protection</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Trusted Platform</h3>
              <p className="text-sm text-gray-600">Millions of users</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Secure Access</h3>
              <p className="text-sm text-gray-600">24/7 monitoring</p>
            </div>
          </div>

          {/* Auth Form */}
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={handleSwitchToRegister}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}

          {/* Premium Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                By continuing, you agree to our enterprise-grade{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Privacy Policy
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>SSL Encrypted • GDPR Compliant • SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
