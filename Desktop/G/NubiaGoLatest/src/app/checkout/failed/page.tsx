'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircleIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { PaymentStatus } from '@/components/payment/payment-status'
import { usePaymentStore } from '@/store/payment'

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearPayment } = usePaymentStore()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    const paymentIdParam = searchParams.get('paymentId')
    const errorParam = searchParams.get('error')
    
    if (orderIdParam) setOrderId(orderIdParam)
    if (paymentIdParam) setPaymentId(paymentIdParam)
    if (errorParam) setError(decodeURIComponent(errorParam))

    // Clear payment data on failed payment
    clearPayment()
  }, [searchParams, clearPayment])

  const handleTryAgain = () => {
    if (orderId) {
      router.push(`/checkout?orderId=${orderId}`)
    } else {
      router.push('/checkout')
    }
  }

  const handleContactSupport = () => {
    router.push('/support')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-8">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-lg text-gray-600">
            We're sorry, but your payment could not be processed. Please try again or contact support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            {paymentId ? (
              <PaymentStatus 
                paymentId={paymentId} 
                onStatusChange={(status) => {
                  if (status === 'failed') {
                    // Payment failed
                  }
                }}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <XCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-900">No Payment Details</h3>
                    <p className="text-sm text-red-700 mt-1">
                      No payment details available. Please try again or contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What Happened?</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {error && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Error Message</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {orderId && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Order ID</h3>
                  <p className="font-mono text-lg text-gray-900">{orderId}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Possible Reasons</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Insufficient funds in your account</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Network connectivity issues</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Payment method not supported</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Transaction timeout</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleTryAgain} 
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  <span>Try Again</span>
                </button>
                <button 
                  onClick={handleContactSupport} 
                  className="w-full bg-white text-gray-700 py-3 px-6 rounded-md font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">
            If you continue to experience issues, our support team is here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Email Support</h4>
              <p className="text-sm text-gray-600">support@nubiago.com</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Phone Support</h4>
              <p className="text-sm text-gray-600">+234 123 456 7890</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Live Chat</h4>
              <p className="text-sm text-gray-600">Available 24/7</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <button 
            onClick={handleGoHome} 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  )
} 
