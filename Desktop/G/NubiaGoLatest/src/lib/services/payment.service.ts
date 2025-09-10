'use client'

import { PaymentMethod, PaymentTransaction } from '@/store/payment'

export interface PaymentGatewayConfig {
  apiKey: string
  secretKey: string
  environment: 'sandbox' | 'production'
  webhookUrl: string
}

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  customerName: string
  customerPhone: string
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer'
  returnUrl: string
  cancelUrl: string
  webhookUrl: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  paymentId: string
  paymentUrl?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  message: string
  transactionId?: string
  fees?: number
  exchangeRate?: number
}

export interface PaymentStatusResponse {
  paymentId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  paidAmount?: number
  paidCurrency?: string
  fees: number
  transactionId?: string
  completedAt?: Date
  failureReason?: string
}

export interface RefundRequest {
  paymentId: string
  amount?: number // Partial refund if specified
  reason: string
}

export interface RefundResponse {
  success: boolean
  refundId: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  currency: string
  message: string
}

class PaymentService {
  private config: PaymentGatewayConfig
  private baseUrl: string

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_PAYMENT_API_KEY || 'pk_test_mock_key',
      secretKey: process.env.PAYMENT_SECRET_KEY || 'sk_test_mock_secret',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
      webhookUrl: process.env.NEXT_PUBLIC_PAYMENT_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/payment`
    }
    
    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api.payment-gateway.com/v1'
      : 'https://sandbox-api.payment-gateway.com/v1'
  }

  /**
   * Initialize a payment transaction
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In production, this would make a real API call
      // For now, we'll simulate the payment gateway response
      
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock different responses based on payment method
      if (request.paymentMethod === 'mobile_money') {
        return {
          success: true,
          paymentId,
          paymentUrl: `${this.baseUrl}/mobile-money/pay/${paymentId}`,
          status: 'pending',
          message: 'Mobile money payment initiated. Please check your phone for payment instructions.',
          transactionId: `txn_${paymentId}`,
          fees: request.amount * 0.025, // 2.5% fee
          exchangeRate: 1
        }
      } else if (request.paymentMethod === 'card') {
        return {
          success: true,
          paymentId,
          paymentUrl: `${this.baseUrl}/card/pay/${paymentId}`,
          status: 'pending',
          message: 'Redirecting to secure card payment page.',
          transactionId: `txn_${paymentId}`,
          fees: request.amount * 0.029, // 2.9% fee
          exchangeRate: 1
        }
      } else if (request.paymentMethod === 'bank_transfer') {
        return {
          success: true,
          paymentId,
          status: 'pending',
          message: 'Bank transfer details have been sent to your email.',
          transactionId: `txn_${paymentId}`,
          fees: 5.00, // Flat fee
          exchangeRate: 1
        }
      }

      throw new Error('Unsupported payment method')
      
    } catch (error) {
      console.error('Payment initiation error:', error)
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment initiation failed'
      }
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock status check - in production this would be a real API call
      const mockStatuses: Array<'pending' | 'completed' | 'failed'> = ['pending', 'completed', 'failed']
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)]
      
      return {
        paymentId,
        status: randomStatus,
        amount: 100.00, // Mock amount
        currency: 'USD',
        paidAmount: randomStatus === 'completed' ? 100.00 : undefined,
        paidCurrency: randomStatus === 'completed' ? 'USD' : undefined,
        fees: 2.50,
        transactionId: `txn_${paymentId}`,
        completedAt: randomStatus === 'completed' ? new Date() : undefined,
        failureReason: randomStatus === 'failed' ? 'Insufficient funds' : undefined
      }
      
    } catch (error) {
      console.error('Payment status check error:', error)
      throw new Error('Failed to check payment status')
    }
  }

  /**
   * Process a refund
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Mock refund processing
      return {
        success: true,
        refundId,
        status: 'pending',
        amount: request.amount || 100.00,
        currency: 'USD',
        message: 'Refund initiated successfully. It may take 3-5 business days to reflect in your account.'
      }
      
    } catch (error) {
      console.error('Refund processing error:', error)
      return {
        success: false,
        refundId: '',
        status: 'failed',
        amount: 0,
        currency: 'USD',
        message: error instanceof Error ? error.message : 'Refund processing failed'
      }
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // In production, you would verify the webhook signature using HMAC
      // For mock purposes, we'll always return true
      return true
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  /**
   * Get supported payment methods for a region
   */
  async getSupportedPaymentMethods(countryCode: string): Promise<PaymentMethod[]> {
    try {
      // Mock supported payment methods based on country
      const allMethods: PaymentMethod[] = [
        {
          id: 'card',
          type: 'card',
          name: 'Credit/Debit Card',
          isDefault: true,
          isActive: true
        },
        {
          id: 'mobile_money',
          type: 'mobile_money',
          name: 'Mobile Money',
          isDefault: false,
          isActive: true
        },
        {
          id: 'bank_transfer',
          type: 'bank',
          name: 'Bank Transfer',
          isDefault: false,
          isActive: true
        }
      ]

      // Filter methods based on country (mock logic)
      if (countryCode === 'UG' || countryCode === 'KE' || countryCode === 'TZ') {
        return allMethods // All methods available in East Africa
      } else if (countryCode === 'US' || countryCode === 'CA' || countryCode === 'GB') {
        return allMethods.filter(method => method.type !== 'mobile_money') // No mobile money in these regions
      }

      return allMethods.filter(method => method.type === 'card') // Default to card only
      
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  /**
   * Calculate payment fees
   */
  calculateFees(amount: number, paymentMethod: string, currency: string = 'USD'): number {
    const feeStructure: Record<string, number> = {
      'card': 0.029, // 2.9%
      'mobile_money': 0.025, // 2.5%
      'bank_transfer': 5.00, // Flat fee
      'crypto': 0.015 // 1.5%
    }

    const feeRate = feeStructure[paymentMethod] || 0.03 // Default 3%
    
    if (paymentMethod === 'bank_transfer') {
      return feeRate // Flat fee
    }
    
    return Math.round(amount * feeRate * 100) / 100 // Percentage fee
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      if (fromCurrency === toCurrency) return 1

      // Mock exchange rates - in production, use a real exchange rate API
      const mockRates: Record<string, number> = {
        'USD_UGX': 3700,
        'USD_KES': 110,
        'USD_TZS': 2300,
        'EUR_USD': 1.08,
        'GBP_USD': 1.25
      }

      const rateKey = `${fromCurrency}_${toCurrency}`
      const reverseKey = `${toCurrency}_${fromCurrency}`
      
      if (mockRates[rateKey]) {
        return mockRates[rateKey]
      } else if (mockRates[reverseKey]) {
        return 1 / mockRates[reverseKey]
      }

      return 1 // Default rate
      
    } catch (error) {
      console.error('Exchange rate fetch error:', error)
      return 1
    }
  }

  /**
   * Validate payment request
   */
  validatePaymentRequest(request: PaymentRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (!request.currency || request.currency.length !== 3) {
      errors.push('Valid currency code is required')
    }

    if (!request.orderId || request.orderId.trim().length === 0) {
      errors.push('Order ID is required')
    }

    if (!request.customerEmail || !/\S+@\S+\.\S+/.test(request.customerEmail)) {
      errors.push('Valid customer email is required')
    }

    if (!request.customerName || request.customerName.trim().length === 0) {
      errors.push('Customer name is required')
    }

    if (!request.paymentMethod || !['card', 'mobile_money', 'bank_transfer'].includes(request.paymentMethod)) {
      errors.push('Valid payment method is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
export default paymentService
