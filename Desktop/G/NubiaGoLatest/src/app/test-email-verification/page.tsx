'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEmailVerificationPage() {
  const { user, checkEmailVerification, resendVerification } = useAuth()
  const [isChecking, setIsChecking] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleCheckVerification = async () => {
    setIsChecking(true)
    try {
      const isVerified = await checkEmailVerification()
      alert(isVerified ? 'Email is verified!' : 'Email is not verified.')
    } catch (error) {
      alert('Error checking verification: ' + error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await resendVerification()
      alert('Verification email sent!')
    } catch (error) {
      alert('Error sending verification email: ' + error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Test</CardTitle>
            <CardDescription>
              Test the email verification functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="space-y-2">
                  <p><strong>User:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Verified:</strong> {user.isVerified ? 'Active' : 'Pending'}</p>
                  <p><strong>Email Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckVerification}
                    disabled={isChecking}
                    className="w-full"
                  >
                    {isChecking ? 'Checking...' : 'Check Email Verification'}
                  </Button>
                  
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>
              </>
            ) : (
              <p>Please log in to test email verification.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
