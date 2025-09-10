'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToastStore } from '@/store/toast'

interface EmailVerificationStatusProps {
  user?: {
    uid: string
    email: string
    emailVerified?: boolean
    role?: string
    status?: string
  }
  onVerificationComplete?: () => void
}

export default function EmailVerificationStatus({ user, onVerificationComplete }: EmailVerificationStatusProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const checkEmailVerification = async () => {
    if (!user) return

    setIsChecking(true)
    try {
      const isVerified = await authService.checkEmailVerification()
      if (isVerified) {
        addToast({
          type: 'success',
          title: 'Email verified successfully!'
        })
        onVerificationComplete?.()
        
        // Redirect based on user role and status
        if (user.role === 'supplier' && user.status === 'pending') {
          router.push('/supplier/pending-approval')
        } else if (user.role === 'customer') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        addToast({
          type: 'error',
          title: 'Email not yet verified',
          message: 'Please check your inbox.'
        })
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to check email verification',
        message: error.message || 'Please try again.'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const resendVerificationEmail = async () => {
    setIsResending(true)
    try {
      await authService.resendEmailVerification()
      setCountdown(60) // 60 second cooldown
      addToast({
        type: 'success',
        title: 'Verification email sent successfully!'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to send verification email',
        message: error.message || 'Please try again later.'
      })
    } finally {
      setIsResending(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-gray-600">
          Please verify your email address to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            We've sent a verification email to <strong>{user.email}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={checkEmailVerification}
            disabled={isChecking}
            className="w-full"
            variant="outline"
          >
            {isChecking ? (
              <>
                <LoadingSpinner className="mr-2" />
                Checking...
              </>
            ) : (
              'Check Verification Status'
            )}
          </Button>

          <Button
            onClick={resendVerificationEmail}
            disabled={isResending || countdown > 0}
            className="w-full"
            variant="secondary"
          >
            {isResending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Verification Email'
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Didn't receive the email? Check your spam folder.</p>
          <p>You can resend the verification email after 60 seconds.</p>
        </div>
      </CardContent>
    </Card>
  )
} 
