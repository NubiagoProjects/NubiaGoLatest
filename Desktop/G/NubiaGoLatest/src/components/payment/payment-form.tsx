'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePaymentStore } from '@/store/payment'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { CreditCard, Smartphone, Building2, CheckCircle } from 'lucide-react'
import { EnhancedMobileMoneyPayment } from './enhanced-mobile-money-payment'

const paymentSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number is required'),
  paymentMethod: z.enum(['mobile_money', 'bank_transfer', 'card']),
  mobileMoneyNumber: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  amount: number
  currency: string
  orderId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PaymentForm({ 
  amount, 
  currency, 
  orderId, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useFirebaseAuth()
  const { initiatePayment, error, isLoading } = usePaymentStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerName: user?.displayName || '',
      customerEmail: user?.email || '',
      customerPhone: '',
      paymentMethod: 'mobile_money'
    }
  })

  const selectedPaymentMethod = watch('paymentMethod')

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsProcessing(true)

      const paymentUrl = await initiatePayment(amount, currency, orderId)

      if (paymentUrl) {
        onSuccess?.()
      } else {
        const errorMessage = error || 'Payment initiation failed'
        onError?.(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment initiation failed'
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentMethods = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Pay with mobile money services',
      popular: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank transfer',
      popular: false
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay with card securely',
      popular: false
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">
              {amount.toLocaleString()} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-sm text-gray-900">{orderId}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Select Payment Method *
        </label>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <label
                key={method.id}
                className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={method.id}
                  {...register('paymentMethod')}
                  className="sr-only"
                />
                <div className="flex items-center h-5">
                  <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{method.name}</span>
                        {method.popular && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </div>
              </label>
            )
          })}
        </div>
        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Customer Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="customerName"
            type="text"
            {...register('customerName')}
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="customerEmail"
            type="email"
            {...register('customerEmail')}
            placeholder="Enter your email address"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            id="customerPhone"
            type="tel"
            {...register('customerPhone')}
            placeholder="Enter your phone number"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerPhone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customerPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
          )}
        </div>
      </div>

      {/* Enhanced Mobile Money Payment - only show if mobile money is selected */}
      {selectedPaymentMethod === 'mobile_money' && (
        <div className="border-t border-gray-200 pt-6">
          <EnhancedMobileMoneyPayment
            amount={amount}
            currency={currency}
            orderId={orderId}
            onPaymentComplete={(paymentId: string) => {
              console.log('Payment completed:', paymentId)
              onSuccess?.()
            }}
            onPaymentFailed={(error: string) => {
              console.error('Payment failed:', error)
              onError?.(error)
            }}
          />
        </div>
      )}

      {/* Other Payment Methods - show form for non-mobile money */}
      {selectedPaymentMethod !== 'mobile_money' && (
        <>
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isProcessing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || isProcessing ? 'Processing...' : `Pay ${amount.toLocaleString()} ${currency}`}
          </button>
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-900">Payment Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  )
} 
