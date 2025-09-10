import { create } from 'zustand'

// Types for mobile money payment system
export interface MobileMoneyOperator {
  id: string
  country: string
  operatorCode: string
  operatorName: string
  gatewayProvider: 'flutterwave' | 'paystack' | 'mock'
  isActive: boolean
  priority: number
  logo?: string
  description?: string
}

export interface MobileMoneyPaymentRequest {
  orderId: string
  amount: number
  currency: string
  customerPhone: string
  customerEmail: string
  customerName: string
  operatorCode: string
  country: string
  redirectUrl: string
  webhookUrl: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  reference?: string
  message: string
  gatewayResponse?: any
  data?: {
    paymentId: string
    paymentUrl?: string
    transactionId?: string
  }
}

export interface MobileMoneyPayment {
  id: string
  orderId: string
  customerId?: string
  amount: number
  currency: string
  operator: string
  country: string
  phoneNumber: string
  gatewayProvider: string
  gatewayTransactionId?: string
  status: 'pending' | 'completed' | 'failed' | 'expired'
  gatewayResponse?: any
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  lastVerificationCheck?: Date
}

// Abstract payment gateway service
export abstract class PaymentGatewayService {
  abstract initiateMobileMoneyPayment(request: MobileMoneyPaymentRequest): Promise<PaymentResponse>
  abstract verifyPayment(transactionId: string): Promise<PaymentResponse>
  abstract getAvailableOperators(country: string): Promise<MobileMoneyOperator[]>
}

// Mock implementation for development
export class MockPaymentGatewayService extends PaymentGatewayService {
  async initiateMobileMoneyPayment(request: MobileMoneyPaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock transaction ID
    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate success/failure (90% success rate for demo)
    const isSuccess = Math.random() > 0.1
    
    if (isSuccess) {
      return {
        success: true,
        transactionId,
        paymentUrl: `${request.redirectUrl}?tx_ref=${transactionId}`,
        reference: transactionId,
        message: 'Payment initiated successfully',
        data: {
          paymentId: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentUrl: `${request.redirectUrl}?tx_ref=${transactionId}`,
          transactionId
        },
        gatewayResponse: {
          status: 'success',
          data: {
            tx_ref: transactionId,
            link: `${request.redirectUrl}?tx_ref=${transactionId}`
          }
        }
      }
    } else {
      return {
        success: false,
        message: 'Payment initiation failed - insufficient funds',
        gatewayResponse: {
          status: 'error',
          message: 'Insufficient funds'
        }
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate payment verification
    const statuses: Array<'pending' | 'completed' | 'failed'> = ['pending', 'completed', 'failed']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    if (randomStatus === 'completed') {
      return {
        success: true,
        transactionId,
        message: 'Payment completed successfully',
        gatewayResponse: {
          status: 'successful',
          data: {
            status: 'successful',
            amount: 1000,
            currency: 'XAF'
          }
        }
      }
    } else if (randomStatus === 'failed') {
      return {
        success: false,
        message: 'Payment failed',
        gatewayResponse: {
          status: 'failed',
          data: {
            status: 'failed'
          }
        }
      }
    } else {
      return {
        success: false,
        message: 'Payment still pending',
        gatewayResponse: {
          status: 'pending',
          data: {
            status: 'pending'
          }
        }
      }
    }
  }

  async getAvailableOperators(country: string): Promise<MobileMoneyOperator[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const operators: MobileMoneyOperator[] = []
    
    switch (country.toUpperCase()) {
      case 'CM': // Cameroon
        operators.push(
          {
            id: '1',
            country: 'CM',
            operatorCode: 'orange_money_cm',
            operatorName: 'Orange Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/orange-money.png',
            description: 'Orange Money Cameroon'
          },
          {
            id: '2',
            country: 'CM',
            operatorCode: 'mtn_cm',
            operatorName: 'MTN Mobile Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/mtn-momo.png',
            description: 'MTN Mobile Money Cameroon'
          },
          {
            id: '3',
            country: 'CM',
            operatorCode: 'express_union',
            operatorName: 'Express Union Mobile Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 3,
            logo: '/operators/express-union.png',
            description: 'Express Union Mobile Money'
          }
        )
        break
        
      case 'CI': // Côte d'Ivoire
        operators.push(
          {
            id: '4',
            country: 'CI',
            operatorCode: 'orange_money_ci',
            operatorName: 'Orange Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/orange-money.png',
            description: 'Orange Money Côte d\'Ivoire'
          },
          {
            id: '5',
            country: 'CI',
            operatorCode: 'mtn_ci',
            operatorName: 'MTN Mobile Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/mtn-momo.png',
            description: 'MTN Mobile Money Côte d\'Ivoire'
          }
        )
        break
        
      case 'GH': // Ghana
        operators.push(
          {
            id: '6',
            country: 'GH',
            operatorCode: 'mtn_gh',
            operatorName: 'MTN Mobile Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/mtn-momo.png',
            description: 'MTN Mobile Money Ghana'
          },
          {
            id: '7',
            country: 'GH',
            operatorCode: 'vodafone_gh',
            operatorName: 'Vodafone Cash',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/vodafone-cash.png',
            description: 'Vodafone Cash Ghana'
          }
        )
        break
        
      case 'KE': // Kenya
        operators.push(
          {
            id: '8',
            country: 'KE',
            operatorCode: 'mpesa',
            operatorName: 'M-Pesa',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/m-pesa.png',
            description: 'Safaricom M-Pesa'
          },
          {
            id: '9',
            country: 'KE',
            operatorCode: 'airtel_ke',
            operatorName: 'Airtel Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/airtel-money.png',
            description: 'Airtel Money Kenya'
          }
        )
        break
        
      case 'UG': // Uganda
        operators.push(
          {
            id: '10',
            country: 'UG',
            operatorCode: 'mtn_ug',
            operatorName: 'MTN Mobile Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/mtn-momo.png',
            description: 'MTN Mobile Money Uganda'
          },
          {
            id: '11',
            country: 'UG',
            operatorCode: 'airtel_ug',
            operatorName: 'Airtel Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/airtel-money.png',
            description: 'Airtel Money Uganda'
          }
        )
        break
        
      case 'SN': // Senegal
        operators.push(
          {
            id: '12',
            country: 'SN',
            operatorCode: 'orange_sn',
            operatorName: 'Orange Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/orange-money.png',
            description: 'Orange Money Senegal'
          },
          {
            id: '13',
            country: 'SN',
            operatorCode: 'mtn_sn',
            operatorName: 'MTN Mobile Money',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/mtn-momo.png',
            description: 'MTN Mobile Money Senegal'
          }
        )
        break
        
      case 'TZ': // Tanzania
        operators.push(
          {
            id: '14',
            country: 'TZ',
            operatorCode: 'mpesa_tz',
            operatorName: 'M-Pesa',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 1,
            logo: '/operators/m-pesa.png',
            description: 'Vodacom M-Pesa Tanzania'
          },
          {
            id: '15',
            country: 'TZ',
            operatorCode: 'tigo_tz',
            operatorName: 'Tigo Pesa',
            gatewayProvider: 'mock',
            isActive: true,
            priority: 2,
            logo: '/operators/tigo-pesa.png',
            description: 'Tigo Pesa Tanzania'
          }
        )
        break
        
      default:
        // Return empty array for unsupported countries
        break
    }
    
    return operators.sort((a, b) => a.priority - b.priority)
  }
}

// Main mobile money service
export class MobileMoneyService {
  private gatewayService: PaymentGatewayService
  private payments: MobileMoneyPayment[] = []

  constructor() {
    // Use mock service for development
    this.gatewayService = new MockPaymentGatewayService()
  }

  async getOperatorsByCountry(country: string): Promise<MobileMoneyOperator[]> {
    return await this.gatewayService.getAvailableOperators(country)
  }

  async initiatePayment(paymentRequest: MobileMoneyPaymentRequest): Promise<PaymentResponse> {
    try {
      // Create payment record
      const paymentRecord: MobileMoneyPayment = {
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        operator: paymentRequest.operatorCode,
        country: paymentRequest.country,
        phoneNumber: paymentRequest.customerPhone,
        gatewayProvider: 'mock', // For now, always mock
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store payment record
      this.payments.push(paymentRecord)

      // Initiate payment with gateway
      const gatewayResponse = await this.gatewayService.initiateMobileMoneyPayment(paymentRequest)

      if (gatewayResponse.success) {
        // Update payment record with gateway details
        paymentRecord.gatewayTransactionId = gatewayResponse.transactionId
        paymentRecord.gatewayResponse = gatewayResponse.gatewayResponse
        paymentRecord.updatedAt = new Date()

        return {
          success: true,
          data: {
            paymentId: paymentRecord.id,
            paymentUrl: gatewayResponse.paymentUrl,
            transactionId: gatewayResponse.transactionId
          },
          transactionId: gatewayResponse.transactionId,
          paymentUrl: gatewayResponse.paymentUrl,
          reference: gatewayResponse.reference,
          message: gatewayResponse.message,
          gatewayResponse: gatewayResponse.gatewayResponse
        }
      } else {
        // Mark payment as failed
        paymentRecord.status = 'failed'
        paymentRecord.updatedAt = new Date()

        return {
          success: false,
          message: gatewayResponse.message
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment initiation failed'
      }
    }
  }

  async getPaymentStatus(paymentId: string): Promise<MobileMoneyPayment | null> {
    const payment = this.payments.find(p => p.id === paymentId)
    if (!payment) return null

    // If payment is still pending, verify with gateway
    if (payment.status === 'pending' && payment.gatewayTransactionId) {
      await this.verifyPendingPayment(payment)
    }

    return payment
  }

  async verifyPendingPayment(payment: MobileMoneyPayment): Promise<void> {
    try {
      // Update last verification check
      payment.lastVerificationCheck = new Date()
      payment.updatedAt = new Date()

      const verification = await this.gatewayService.verifyPayment(payment.gatewayTransactionId!)

      if (verification.success && verification.gatewayResponse?.data?.status === 'successful') {
        // Payment completed
        payment.status = 'completed'
        payment.completedAt = new Date()
        payment.updatedAt = new Date()
        payment.gatewayResponse = verification.gatewayResponse

        console.log(`Payment ${payment.id} completed via verification`)
      } else if (this.isPaymentExpired(payment)) {
        // Mark as expired if too old
        payment.status = 'expired'
        payment.updatedAt = new Date()
        
        console.log(`Payment ${payment.id} marked as expired`)
      }
    } catch (error) {
      console.error(`Failed to verify payment ${payment.id}:`, error)
    }
  }

  private isPaymentExpired(payment: MobileMoneyPayment): boolean {
    const hoursSinceCreation = (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceCreation > 24 // Expire after 24 hours
  }

  async getAllPayments(): Promise<MobileMoneyPayment[]> {
    return this.payments
  }

  async getPaymentsByStatus(status: MobileMoneyPayment['status']): Promise<MobileMoneyPayment[]> {
    return this.payments.filter(p => p.status === status)
  }

  async getPaymentsByCountry(country: string): Promise<MobileMoneyPayment[]> {
    return this.payments.filter(p => p.country === country)
  }

  async getPaymentsByOperator(operator: string): Promise<MobileMoneyPayment[]> {
    return this.payments.filter(p => p.operator === operator)
  }
}

// Create singleton instance
export const mobileMoneyService = new MobileMoneyService()

// Zustand store for mobile money payments
interface MobileMoneyState {
  payments: MobileMoneyPayment[]
  operators: MobileMoneyOperator[]
  selectedCountry: string
  selectedOperator: string
  isLoading: boolean
  error: string | null
}

interface MobileMoneyActions {
  setPayments: (payments: MobileMoneyPayment[]) => void
  addPayment: (payment: MobileMoneyPayment) => void
  updatePayment: (id: string, updates: Partial<MobileMoneyPayment>) => void
  setOperators: (operators: MobileMoneyOperator[]) => void
  setSelectedCountry: (country: string) => void
  setSelectedOperator: (operator: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  fetchOperators: (country: string) => Promise<void>
  initiatePayment: (request: MobileMoneyPaymentRequest) => Promise<PaymentResponse>
  getPaymentStatus: (paymentId: string) => Promise<MobileMoneyPayment | null>
}

export const useMobileMoneyStore = create<MobileMoneyState & MobileMoneyActions>((set, get) => ({
  payments: [],
  operators: [],
  selectedCountry: '',
  selectedOperator: '',
  isLoading: false,
  error: null,

  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  setOperators: (operators) => set({ operators }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedOperator: (operator) => set({ selectedOperator: operator }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchOperators: async (country: string) => {
    set({ isLoading: true, error: null })
    try {
      const operators = await mobileMoneyService.getOperatorsByCountry(country)
      set({ operators, selectedCountry: country })
      if (operators.length > 0) {
        set({ selectedOperator: operators[0].operatorCode })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch operators' })
    } finally {
      set({ isLoading: false })
    }
  },

  initiatePayment: async (request: MobileMoneyPaymentRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await mobileMoneyService.initiatePayment(request)
      if (response.success && response.data) {
        // Add payment to store
        const payment: MobileMoneyPayment = {
          id: response.data.paymentId,
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          operator: request.operatorCode,
          country: request.country,
          phoneNumber: request.customerPhone,
          gatewayProvider: 'mock',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        get().addPayment(payment)
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment initiation failed'
      set({ error: errorMessage })
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      set({ isLoading: false })
    }
  },

  getPaymentStatus: async (paymentId: string) => {
    try {
      const payment = await mobileMoneyService.getPaymentStatus(paymentId)
      if (payment) {
        get().updatePayment(paymentId, payment)
      }
      return payment
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get payment status' })
      return null
    }
  }
}))
