'use client'

import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { CreditCard, Lock, Eye, EyeOff, Shield } from 'lucide-react'

const creditCardSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be no more than 19 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  cardholderName: z.string()
    .min(1, 'Cardholder name is required')
    .max(100, 'Cardholder name is too long'),
  expiryMonth: z.string()
    .min(1, 'Expiry month is required')
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid expiry month'),
  expiryYear: z.string()
    .min(1, 'Expiry year is required')
    .regex(/^\d{4}$/, 'Invalid expiry year'),
  cvv: z.string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV must be no more than 4 digits')
    .regex(/^\d+$/, 'CVV must contain only digits'),
  saveCard: z.boolean().optional(),
})

type CreditCardFormData = z.infer<typeof creditCardSchema>

interface CreditCardFormProps {
  amount: number
  currency: string
  onSuccess?: (cardData: CreditCardFormData) => void
  onError?: (error: string) => void
  className?: string
}

export function CreditCardForm({
  amount,
  currency,
  onSuccess,
  onError,
  className = ''
}: CreditCardFormProps) {
  const [showCvv, setShowCvv] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardType, setCardType] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: false,
    },
  })

  const watchedCardNumber = watch('cardNumber')

  // Detect card type based on number
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '')
    
    if (/^4/.test(cleanNumber)) return 'visa'
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard'
    if (/^3[47]/.test(cleanNumber)) return 'amex'
    if (/^6/.test(cleanNumber)) return 'discover'
    if (/^35/.test(cleanNumber)) return 'jcb'
    if (/^3[0-9]/.test(cleanNumber)) return 'diners'
    
    return 'unknown'
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, '').replace(/\D/g, '')
    const cardType = detectCardType(cleanValue)
    
    let formatted = cleanValue
    if (cardType === 'amex') {
      formatted = cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    } else {
      formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
    
    setCardType(cardType)
    return formatted
  }

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4)
    }
    return cleanValue
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setValue('cardNumber', formatted)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setValue('expiryMonth', formatted.slice(0, 2))
    setValue('expiryYear', '20' + formatted.slice(3, 5))
  }

  const onSubmit = async (data: CreditCardFormData) => {
    try {
      setIsProcessing(true)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would send this to your payment processor
      console.log('Processing payment with card data:', {
        ...data,
        cardNumber: data.cardNumber.replace(/\s/g, '').slice(-4), // Only last 4 digits
      })
      
      toast.success('Payment processed successfully')
      onSuccess?.(data)
    } catch (error: any) {
      const errorMessage = error.message || 'Payment processing failed'
      toast.error('Payment Error', errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      case 'discover':
        return '💳'
      default:
        return '💳'
    }
  }

  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  const getExpiryYears = () => {
    const currentYear = getCurrentYear()
    const years = []
    for (let i = 0; i < 10; i++) {
      years.push(currentYear + i)
    }
    return years
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-medium text-gray-900">Credit Card Payment</h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-lg">
            {amount.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <Input
              {...register('cardNumber')}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`pr-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-lg">{getCardIcon()}</span>
            </div>
          </div>
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <Input
            {...register('cardholderName')}
            placeholder="John Doe"
            className={errors.cardholderName ? 'border-red-500' : ''}
          />
          {errors.cardholderName && (
            <p className="text-red-500 text-sm mt-1">{errors.cardholderName.message}</p>
          )}
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                {...register('expiryMonth')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                {...register('expiryYear')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">YYYY</option>
                {getExpiryYears().map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {(errors.expiryMonth || errors.expiryYear) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.expiryMonth?.message || errors.expiryYear?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <div className="relative">
              <Input
                {...register('cvv')}
                type={showCvv ? 'text' : 'password'}
                placeholder="123"
                maxLength={4}
                className={`pr-10 ${errors.cvv ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showCvv ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
            )}
          </div>
        </div>

        {/* Save Card Option */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveCard"
            {...register('saveCard')}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="saveCard" className="text-sm text-gray-700">
            Save this card for future payments
          </label>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Secure Payment</p>
              <p className="text-blue-600 mt-1">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Pay {amount.toLocaleString()} {currency}</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  )
} 

export default CreditCardForm; 
