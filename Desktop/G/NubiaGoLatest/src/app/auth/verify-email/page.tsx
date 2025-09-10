'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { emailVerificationService } from '@/lib/services/email-verification.service'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const token = searchParams.get('token')
  const userId = searchParams.get('userId')

  useEffect(() => {
    // If we have token and userId in URL, verify automatically
    if (token && userId) {
      verifyEmailToken()
    }
  }, [token, userId])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const verifyEmailToken = async () => {
    if (!token || !userId) return
    
    setIsVerifying(true)
    try {
      const result = await emailVerificationService.verifyEmail(token, userId)
      if (result.success) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        setTimeout(() => router.push('/customer'), 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Verification failed')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!user?.uid) return
    
    setIsLoading(true)
    try {
      const result = await emailVerificationService.resendVerificationEmail(user.uid)
      if (result.success) {
        setCountdown(60)
        setMessage('Verification email sent successfully!')
      } else {
        setMessage(result.error || 'Failed to send verification email')
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          <Link 
            href="/auth/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-md mb-6 ${
            message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={resendVerificationEmail}
            disabled={isLoading || countdown > 0 || !user}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend verification email'
            )}
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>Didn't receive the email? Check your spam folder.</p>
            {!user && (
              <p className="mt-2 text-red-600">Please log in to resend verification email.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
