'use client'

import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { Smartphone, Shield, Phone, User, Mail } from 'lucide-react'

const mobileMoneySchema = z.object({
  provider: z.enum(['mpesa', 'airtel_money', 'mtn_momo', 'vodafone_cash', 'orange_money', 'tigo_pesa']),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be no more than 15 digits')
    .regex(/^\+?[\d\s-]+$/, 'Invalid phone number format'),
  customerName: z.string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name is too long'),
  customerEmail: z.string()
    .email('Invalid email address')
    .optional(),
  savePaymentMethod: z.boolean().optional(),
})

type MobileMoneyFormData = z.infer<typeof mobileMoneySchema>

interface MobileMoneyFormProps {
  amount: number
  currency: string
  onSuccess?: (paymentData: MobileMoneyFormData) => void
  onError?: (error: string) => void
  className?: string
}

export function MobileMoneyForm(props: MobileMoneyFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MobileMoneyFormData>({
    resolver: zodResolver(mobileMoneySchema),
    defaultValues: {
      provider: 'mpesa',
      phoneNumber: '',
      customerName: '',
      customerEmail: '',
      savePaymentMethod: false,
    },
  })

  const watchedProvider = watch('provider')

  const mobileMoneyProviders = [
    {
      code: 'mpesa',
      name: 'M-Pesa',
      country: 'Kenya',
      icon: '📱',
      description: 'Safaricom M-Pesa',
    },
    {
      code: 'airtel_money',
      name: 'Airtel Money',
      country: 'Multiple',
      icon: '📱',
      description: 'Airtel Money',
    },
    {
      code: 'mtn_momo',
      name: 'MTN MoMo',
      country: 'Ghana',
      icon: '📱',
      description: 'MTN Mobile Money',
    },
    {
      code: 'vodafone_cash',
      name: 'Vodafone Cash',
      country: 'Ghana',
      icon: '📱',
      description: 'Vodafone Cash',
    },
    {
      code: 'orange_money',
      name: 'Orange Money',
      country: 'Multiple',
      icon: '📱',
      description: 'Orange Money',
    },
    {
      code: 'tigo_pesa',
      name: 'Tigo Pesa',
      country: 'Tanzania',
      icon: '📱',
      description: 'Tigo Pesa',
    },
  ]

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleanValue = value.replace(/[^\d+]/g, '')
    
    // Ensure it starts with + if it's an international number
    if (cleanValue.length > 0 && !cleanValue.startsWith('+')) {
      return cleanValue
    }
    
    return cleanValue
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setValue('phoneNumber', formatted)
  }

  const getProviderInfo = (providerCode: string) => {
    return mobileMoneyProviders.find(p => p.code === providerCode)
  }

  const onSubmit = async (data: MobileMoneyFormData) => {
    try {
      setIsProcessing(true)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, you would send this to your payment processor
      console.log('Processing mobile money payment:', {
        ...data,
        amount: props.amount,
        currency: props.currency,
      })
      
      toast.success('Payment initiated successfully')
      props.onSuccess?.(data)
    } catch (error: any) {
      const errorMessage = error.message || 'Payment processing failed'
      toast.error('Payment Error', errorMessage)
      props.onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getProviderIcon = (providerCode: string) => {
    const provider = getProviderInfo(providerCode)
    return provider?.icon || '📱'
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${props.className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Smartphone className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-medium text-gray-900">Mobile Money Payment</h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-lg">
            {props.amount.toLocaleString()} {props.currency}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Mobile Money Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Money Provider
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mobileMoneyProviders.map((provider) => (
              <label
                key={provider.code}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  watchedProvider === provider.code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={provider.code}
                  {...register('provider')}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{provider.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-500">{provider.description}</div>
                  </div>
                </div>
                {watchedProvider === provider.code && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
          {errors.provider && (
            <p className="text-red-500 text-sm mt-1">{errors.provider.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              {...register('phoneNumber')}
              onChange={handlePhoneNumberChange}
              placeholder="+254 700 000 000"
              className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter the phone number registered with your mobile money account
          </p>
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              {...register('customerName')}
              placeholder="Enter your full name"
              className={`pl-10 ${errors.customerName ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
          )}
        </div>

        {/* Customer Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              {...register('customerEmail')}
              type="email"
              placeholder="your@email.com"
              className={`pl-10 ${errors.customerEmail ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.customerEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
          )}
        </div>

        {/* Save Payment Method */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="savePaymentMethod"
            {...register('savePaymentMethod')}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="savePaymentMethod" className="text-sm text-gray-700">
            Save this payment method for future use
          </label>
        </div>

        {/* Provider Information */}
        {watchedProvider && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getProviderIcon(watchedProvider)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">
                  {getProviderInfo(watchedProvider)?.name}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  You will receive a payment prompt on your phone. Please follow the instructions to complete the payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Secure Mobile Payment</p>
              <p className="text-green-700 mt-1">
                Your payment is processed securely through your mobile money provider. We never store your payment details.
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
              <span>Initiating Payment...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Pay {props.amount.toLocaleString()} {props.currency}</span>
            </div>
          )}
        </Button>
      </form>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Select your mobile money provider</li>
          <li>2. Enter your registered phone number</li>
          <li>3. Click "Pay" to initiate the payment</li>
          <li>4. You'll receive a payment prompt on your phone</li>
          <li>5. Enter your PIN to complete the payment</li>
        </ol>
      </div>
    </div>
  )
}

export default MobileMoneyForm; 
