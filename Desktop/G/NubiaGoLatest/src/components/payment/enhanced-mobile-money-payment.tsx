'use client'

import React, { useState, useEffect } from 'react'
import { useMobileMoneyStore, MobileMoneyPaymentRequest } from '@/lib/services/mobile-money.service'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Smartphone, Globe, Phone, User, Mail, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface EnhancedMobileMoneyPaymentProps {
  orderId: string
  amount: number
  currency: string
  onPaymentComplete: (paymentId: string) => void
  onPaymentFailed: (error: string) => void
  className?: string
}

export const EnhancedMobileMoneyPayment: React.FC<EnhancedMobileMoneyPaymentProps> = ({
  orderId,
  amount,
  currency,
  onPaymentComplete,
  onPaymentFailed,
  className = ''
}) => {
  const { user } = useFirebaseAuth()
  const {
    operators,
    selectedCountry,
    selectedOperator,
    isLoading,
    error,
    fetchOperators,
    setSelectedCountry,
    setSelectedOperator,
    initiatePayment,
    clearError
  } = useMobileMoneyStore()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [customerName, setCustomerName] = useState(user?.displayName || '')
  const [customerEmail, setCustomerEmail] = useState(user?.email || '')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'pending' | 'completed' | 'failed'>('idle')
  const [paymentId, setPaymentId] = useState<string>('')

  // Auto-detect country from phone number or user location
  useEffect(() => {
    detectUserCountry()
  }, [])

  // Fetch operators when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchOperators(selectedCountry)
    }
  }, [selectedCountry, fetchOperators])

  const detectUserCountry = async () => {
    try {
      // Try to detect from phone number first
      const detectedCountry = detectCountryFromPhone(phoneNumber)
      if (detectedCountry) {
        setSelectedCountry(detectedCountry)
        return
      }

      // Fallback to IP-based detection (mock for now)
      const mockCountries = ['CM', 'CI', 'GH', 'KE', 'UG', 'SN', 'TZ']
      const randomCountry = mockCountries[Math.floor(Math.random() * mockCountries.length)]
      setSelectedCountry(randomCountry)
    } catch (error) {
      console.error('Country detection failed:', error)
      // Default to Cameroon as most common
      setSelectedCountry('CM')
    }
  }

  const detectCountryFromPhone = (phone: string): string | null => {
    if (!phone) return null
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Country code detection based on phone number patterns
    if (cleanPhone.startsWith('237')) return 'CM' // Cameroon
    if (cleanPhone.startsWith('225')) return 'CI' // Côte d'Ivoire
    if (cleanPhone.startsWith('233')) return 'GH' // Ghana
    if (cleanPhone.startsWith('254')) return 'KE' // Kenya
    if (cleanPhone.startsWith('256')) return 'UG' // Uganda
    if (cleanPhone.startsWith('221')) return 'SN' // Senegal
    if (cleanPhone.startsWith('255')) return 'TZ' // Tanzania
    
    return null
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedOperator('') // Reset operator when country changes
  }

  const handleOperatorSelect = (operatorCode: string) => {
    setSelectedOperator(operatorCode)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    
    // Auto-detect country from phone number if not already set
    if (!selectedCountry) {
      const detectedCountry = detectCountryFromPhone(value)
      if (detectedCountry) {
        setSelectedCountry(detectedCountry)
      }
    }
  }

  const handlePaymentInitiation = async () => {
    if (!selectedOperator || !phoneNumber || !customerName || !customerEmail) {
      onPaymentFailed('Please fill in all required fields')
      return
    }

    setPaymentStatus('initiating')
    clearError()

    try {
      const paymentRequest: MobileMoneyPaymentRequest = {
        orderId,
        amount,
        currency,
        customerPhone: phoneNumber,
        customerEmail,
        customerName,
        operatorCode: selectedOperator,
        country: selectedCountry,
        redirectUrl: `${window.location.origin}/payment/success`,
        webhookUrl: `${window.location.origin}/api/mobile-money/webhook`
      }

      const response = await initiatePayment(paymentRequest)
      
      if (response.success && response.data) {
        setPaymentId(response.data.paymentId)
        setPaymentStatus('pending')
        
        // Start polling for payment status
        pollPaymentStatus(response.data.paymentId)
        
        // If there's a payment URL, redirect to it
        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl
        }
      } else {
        setPaymentStatus('failed')
        onPaymentFailed(response.message || 'Payment initiation failed')
      }
    } catch (error) {
      setPaymentStatus('failed')
      onPaymentFailed('Payment initiation failed')
    }
  }

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/mobile-money/status/${paymentId}`)
        const data = await response.json()

        if (data.success) {
          if (data.data.status === 'completed') {
            setPaymentStatus('completed')
            onPaymentComplete(paymentId)
            return
          } else if (data.data.status === 'failed') {
            setPaymentStatus('failed')
            onPaymentFailed('Payment failed')
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setPaymentStatus('failed')
          onPaymentFailed('Payment verification timeout')
        }
      } catch (error) {
        setPaymentStatus('failed')
        onPaymentFailed('Payment status check failed')
      }
    }

    poll()
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />
      case 'initiating':
        return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
      default:
        return <Smartphone className="h-6 w-6 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Payment Completed'
      case 'failed':
        return 'Payment Failed'
      case 'pending':
        return 'Payment Pending'
      case 'initiating':
        return 'Initiating Payment...'
      default:
        return 'Ready to Pay'
    }
  }

  const isFormValid = selectedCountry && selectedOperator && phoneNumber && customerName && customerEmail

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Smartphone className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Mobile Money Payment</h2>
      </div>

      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Amount:</span>
          <span className="text-2xl font-bold text-blue-900">
            {currency} {amount.toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">Order: {orderId}</div>
      </div>

      {/* Status Display */}
      {paymentStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          paymentStatus === 'completed' ? 'bg-green-50 border-green-200' :
          paymentStatus === 'failed' ? 'bg-red-50 border-red-200' :
          paymentStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <div className="font-medium text-gray-900">{getStatusText()}</div>
              {paymentStatus === 'pending' && (
                <div className="text-sm text-gray-600">
                  Please complete the payment on your phone. We'll notify you when it's done.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Country Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Globe className="inline h-4 w-4 mr-2" />
          Country *
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={isLoading || paymentStatus !== 'idle'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select Country</option>
          <option value="CM">🇨🇲 Cameroon</option>
          <option value="CI">🇨🇮 Côte d'Ivoire</option>
          <option value="GH">🇬🇭 Ghana</option>
          <option value="KE">🇰🇪 Kenya</option>
          <option value="UG">🇺🇬 Uganda</option>
          <option value="SN">🇸🇳 Senegal</option>
          <option value="TZ">🇹🇿 Tanzania</option>
        </select>
      </div>

      {/* Operator Selection */}
      {operators.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Smartphone className="inline h-4 w-4 mr-2" />
            Mobile Money Operator *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {operators.map((operator) => (
              <div
                key={operator.operatorCode}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOperator === operator.operatorCode
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleOperatorSelect(operator.operatorCode)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {operator.logo ? (
                      <img 
                        src={`/operators/${operator.operatorCode}.png`} 
                        alt={operator.operatorName}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'block'
                          }
                        }}
                      />
                    ) : null}
                    <span className="text-2xl" style={{ display: operator.logo ? 'none' : 'block' }}>
                      📱
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{operator.operatorName}</div>
                    <div className="text-sm text-gray-500">{operator.description}</div>
                  </div>
                </div>
                {selectedOperator === operator.operatorCode && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Information */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={paymentStatus !== 'idle'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline h-4 w-4 mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            disabled={paymentStatus !== 'idle'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-2" />
            Mobile Money Number *
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={paymentStatus !== 'idle'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Enter your mobile money number"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll send payment instructions to this number
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Secure Mobile Payment</p>
            <p className="text-green-700 mt-1">
              Your payment is processed securely through your mobile money provider. 
              We never store your payment details.
            </p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePaymentInitiation}
        disabled={!isFormValid || isLoading || paymentStatus !== 'idle'}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          isFormValid && paymentStatus === 'idle'
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading || paymentStatus === 'initiating' ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Initiating Payment...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Pay {currency} {amount.toLocaleString()}</span>
          </div>
        )}
      </button>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">How it works:</h4>
        <ol className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
            <span>Select your country and mobile money operator</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
            <span>Enter your details and mobile money number</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
            <span>Click "Pay" to initiate the payment</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</span>
            <span>You'll receive a payment prompt on your phone</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">5</span>
            <span>Enter your PIN to complete the payment</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
