'use client'

import { useEffect, useState } from 'react'
import { usePaymentStore } from '@/store/payment'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface PaymentStatusProps {
  paymentId: string
  onStatusChange?: (status: string) => void
}

export function PaymentStatus({ paymentId, onStatusChange }: PaymentStatusProps) {
  const { checkPaymentStatus, status, amount, currency, targetAmount, targetCurrency, exchangeRate, fees, isLoading, error } = usePaymentStore()
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus(paymentId)
    }
  }, [paymentId])

  useEffect(() => {
    if (status && onStatusChange) {
      onStatusChange(status)
    }
  }, [status, onStatusChange])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoRefresh && paymentId && status !== 'completed' && status !== 'failed') {
      interval = setInterval(() => {
        checkPaymentStatus(paymentId)
      }, 10000) // Check every 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh, paymentId, status, checkPaymentStatus])

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />
      case 'failed':
        return <XCircleIcon className="h-8 w-8 text-red-600" />
      case 'processing':
        return <ClockIcon className="h-8 w-8 text-yellow-600" />
      default:
        return <ExclamationTriangleIcon className="h-8 w-8 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Payment Completed'
      case 'failed':
        return 'Payment Failed'
      case 'processing':
        return 'Payment Processing'
      case 'pending':
        return 'Payment Pending'
      default:
        return 'Unknown Status'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
        return 'Your payment has been successfully processed. Your order will be shipped shortly.'
      case 'failed':
        return 'We were unable to process your payment. Please try again or contact support.'
      case 'processing':
        return 'Your payment is being processed. This may take a few moments.'
      case 'pending':
        return 'Your payment is pending. Please complete the payment using the provided method.'
      default:
        return 'Checking payment status...'
    }
  }

  const handleRefresh = () => {
    if (paymentId) {
      checkPaymentStatus(paymentId)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Checking payment status...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <XCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{getStatusText()}</h3>
              <p className="text-sm text-gray-500">Payment ID: {paymentId}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
            {status?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Status Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">{getStatusMessage()}</p>
        </div>

        {/* Payment Details */}
        {amount && currency && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Payment Amount</h4>
              <p className="text-2xl font-semibold text-gray-900">
                {amount.toLocaleString()} {currency}
              </p>
            </div>
            
            {targetAmount && targetCurrency && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Converted Amount</h4>
                <p className="text-2xl font-semibold text-gray-900">
                  {targetAmount.toFixed(2)} {targetCurrency}
                </p>
                {exchangeRate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Rate: 1 {currency} = {exchangeRate.toFixed(4)} {targetCurrency}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Transaction Fees */}
        {fees && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Transaction Fees</h4>
            <p className="text-lg font-semibold text-blue-900">
              {fees.toFixed(2)} {currency}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh status
            </label>
          </div>
          
          <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Status-specific messages */}
      {status === 'pending' && (
        <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Payment Pending</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please complete your payment using the provided link or method. You can close this page and return later to check the status.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Payment Successful</h4>
              <p className="text-sm text-green-700 mt-1">
                Your payment has been confirmed. You'll receive an email confirmation shortly, and your order will be processed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-200">
          <div className="flex items-start space-x-3">
            <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Payment Failed</h4>
              <p className="text-sm text-red-700 mt-1">
                We couldn't process your payment. Please try again or contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
