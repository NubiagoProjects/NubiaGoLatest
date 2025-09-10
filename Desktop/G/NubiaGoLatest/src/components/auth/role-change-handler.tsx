'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToastStore } from '@/store/toast'

interface RoleChangeHandlerProps {
  children: React.ReactNode
}

export function RoleChangeHandler({ children }: RoleChangeHandlerProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (!user) return

    // Handle role changes and status updates
    const handleRoleChange = () => {
      // If user is not verified, redirect to suspended page
      if (!user.isVerified) {
        addToast({
          type: 'error',
          title: 'Account Suspended',
          message: 'Your account has been suspended. Please contact support.'
        })
        router.push('/account-suspended')
        return
      }

      // If user is pending email verification, redirect to verification page
      if (!user.isVerified) {
        addToast({
          type: 'error',
          title: 'Email Verification Required',
          message: 'Please verify your email address to continue.'
        })
        router.push('/auth/verify-email')
        return
      }

      // If supplier is pending approval, redirect to pending approval page
      if (user.role === 'supplier' && !user.isVerified) {
        addToast({
          type: 'info',
          title: 'Account Pending Approval',
          message: 'Your supplier account is pending approval. You will be notified once approved.'
        })
        router.push('/supplier/pending-approval')
        return
      }

      // If customer was pending but now verified, show success message
      if (user.role === 'customer' && user.isVerified) {
        // Only show this if they were previously pending
        const wasPending = sessionStorage.getItem('wasPending')
        if (wasPending === 'true') {
          addToast({
            type: 'success',
            title: 'Email Verified Successfully!',
            message: 'Welcome to our marketplace.'
          })
          sessionStorage.removeItem('wasPending')
        }
      }
    }

    handleRoleChange()
  }, [user, router, addToast])

  // Store pending status for customers
  useEffect(() => {
    if (user?.role === 'customer' && !user?.isVerified) {
      sessionStorage.setItem('wasPending', 'true')
    }
  }, [user])

  return <>{children}</>
} 
