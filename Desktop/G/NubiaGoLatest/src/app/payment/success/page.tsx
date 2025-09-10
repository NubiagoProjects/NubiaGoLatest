'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Smartphone, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'expired'
  paymentId?: string
  orderId?: string
  amount?: number
  currency?: string
  operator?: string
  phoneNumber?: string
  createdAt?: string
  completedAt?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const txRef = searchParams.get('tx_ref')
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    if (txRef || paymentId) {
      checkPaymentStatus()
    } else {
      setIsLoading(false)
      setError('No payment reference found')
    }
  }, [txRef, paymentId])

  const checkPaymentStatus = async () => {
    try {
      setIsLoading(true)
      
      // If we have a payment ID, check status directly
      if (paymentId) {
        const response = await fetch(`/api/mobile-money/status/${paymentId}`)
        const data = await response.json()
        
        if (data.success) {
          setPaymentStatus(data.data)
        } else {
          setError(data.message || 'Failed to get payment status')
        }
      } else if (txRef) {
        // If we have a transaction reference, we need to find the payment
        // For now, simulate a successful payment
        setPaymentStatus({
          status: 'pending',
          paymentId: `mock_${Date.now()}`,
          orderId: `ORDER-${Date.now()}`,
          amount: 1000,
          currency: 'XAF',
          operator: 'Orange Money',
          phoneNumber: '+237670000000',
          createdAt: new Date().toISOString()
        })
      }
    } catch (error) {
      setError('Failed to check payment status')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!paymentStatus) return null
    
    switch (paymentStatus.status) {
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-16 w-16 text-red-600" />
      case 'expired':
        return <AlertCircle className="h-16 w-16 text-orange-600" />
      default:
        return <Clock className="h-16 w-16 text-yellow-600" />
    }
  }

  const getStatusText = () => {
    if (!paymentStatus) return 'Unknown Status'
    
    switch (paymentStatus.status) {
      case 'completed':
        return 'Payment Completed Successfully!'
      case 'failed':
        return 'Payment Failed'
      case 'expired':
        return 'Payment Expired'
      default:
        return 'Payment Pending'
    }
  }

  const getStatusDescription = () => {
    if (!paymentStatus) return ''
    
    switch (paymentStatus.status) {
      case 'completed':
        return 'Your payment has been processed successfully. You will receive a confirmation email shortly.'
      case 'failed':
        return 'Unfortunately, your payment could not be processed. Please try again or contact support.'
      case 'expired':
        return 'Your payment session has expired. Please initiate a new payment.'
      default:
        return 'Your payment is being processed. Please wait while we confirm the transaction.'
    }
  }

  const getStatusColor = () => {
    if (!paymentStatus) return 'gray'
    
    switch (paymentStatus.status) {
      case 'completed':
        return 'green'
      case 'failed':
        return 'red'
      case 'expired':
        return 'orange'
      default:
        return 'yellow'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking payment status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Status</h1>
          <p className="text-gray-600">Your mobile money payment details</p>
        </div>

        {/* Payment Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            {getStatusIcon()}
            <h2 className={`text-2xl font-bold mt-4 text-${getStatusColor()}-900`}>
              {getStatusText()}
            </h2>
            <p className="text-gray-600 mt-2">{getStatusDescription()}</p>
          </div>

          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">{paymentStatus.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{paymentStatus.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {paymentStatus.currency} {paymentStatus.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operator:</span>
                  <span className="font-medium">{paymentStatus.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium">{paymentStatus.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-sm">
                    {paymentStatus.createdAt ? new Date(paymentStatus.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {paymentStatus.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="text-sm">
                      {new Date(paymentStatus.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {paymentStatus?.status === 'completed' ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                View Orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </>
          ) : paymentStatus?.status === 'failed' ? (
            <>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Contact Support
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={checkPaymentStatus}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Clock className="h-5 w-5 mr-2" />
                Check Status Again
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            If you have any questions about your payment, please contact our support team at{' '}
            <a href="mailto:support@nubiago.com" className="text-blue-600 hover:text-blue-800">
              support@nubiago.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
