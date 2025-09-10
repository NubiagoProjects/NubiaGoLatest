'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react'
import { CreditCardForm } from './credit-card-form'
import { MobileMoneyForm } from './mobile-money-form'
import { EnhancedMobileMoneyPayment } from './enhanced-mobile-money-payment'
import { PaymentForm } from './payment-form'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'wallet'
  available: boolean
}

interface PaymentMethodSelectorProps {
  amount: number
  currency: string
  orderId?: string
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
  className?: string
}

export function PaymentMethodSelector({ 
  amount, 
  currency, 
  orderId = `ORDER-${Date.now()}`,
  onSuccess, 
  onError, 
  className = '' 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or other cards',
      icon: <CreditCard className="h-5 w-5" />,
      type: 'card',
      available: true,
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Pay with M-Pesa, Airtel Money, or other mobile money',
      icon: <Smartphone className="h-5 w-5" />,
      type: 'mobile_money',
      available: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer or wire transfer',
      icon: <Building2 className="h-5 w-5" />,
      type: 'bank_transfer',
      available: true,
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay with PayPal, Apple Pay, or Google Pay',
      icon: <Wallet className="h-5 w-5" />,
      type: 'wallet',
      available: false, // Disabled for demo
    },
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handlePaymentSuccess = (paymentData: any) => {
    onSuccess?.(paymentData)
  }

  const handlePaymentError = (error: string) => {
    onError?.(error)
  }

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <CreditCardForm
            amount={amount}
            currency={currency}
            onSuccess={() => handlePaymentSuccess({})}
            onError={handlePaymentError}
          />
        )
      case 'mobile_money':
        return (
          <EnhancedMobileMoneyPayment
            orderId={orderId}
            amount={amount}
            currency={currency}
            onPaymentComplete={(paymentId) => handlePaymentSuccess({ paymentId, method: 'mobile_money' })}
            onPaymentFailed={handlePaymentError}
          />
        )
      case 'bank_transfer':
      case 'wallet':
        return (
          <PaymentForm
            amount={amount}
            currency={currency}
            orderId={orderId}
            onSuccess={() => handlePaymentSuccess({})}
            onError={handlePaymentError}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : method.available
                    ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => handleMethodSelect(method.id)}
                disabled={!method.available}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                  {!method.available && (
                    <div className="text-xs text-gray-400 mt-1">Coming soon</div>
                  )}
                </div>
              </div>
              {selectedMethod === method.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Payment Form */}
      {selectedMethod && (
        <div className="border-t pt-6">
          {renderPaymentForm()}
        </div>
      )}

      {/* Payment Summary */}
      {selectedMethod && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">{currency} {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-medium">
                {paymentMethods.find(m => m.id === selectedMethod)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-medium font-mono">{orderId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
