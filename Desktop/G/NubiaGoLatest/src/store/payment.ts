import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'mobile_money' | 'crypto'
  name: string
  last4?: string
  brand?: string
  isDefault: boolean
  isActive: boolean
}

export interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  method: string
  orderId: string
  paymentUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentForm {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface PaymentState {
  methods: PaymentMethod[]
  selectedMethod: PaymentMethod | null
  transactions: PaymentTransaction[]
  currentTransaction: PaymentTransaction | null
  paymentUrl: string | null
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  isLoading: boolean
  error: string | null
  amount: number
  currency: string
  targetAmount: number
  targetCurrency: string
  exchangeRate: number
  fees: number
}

interface PaymentActions {
  // Payment methods
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void
  removePaymentMethod: (id: string) => void
  setDefaultMethod: (id: string) => void
  selectMethod: (method: PaymentMethod | null) => void
  
  // Transactions
  addTransaction: (transaction: PaymentTransaction) => void
  updateTransaction: (id: string, updates: Partial<PaymentTransaction>) => void
  getTransaction: (id: string) => PaymentTransaction | undefined
  
  // Payment processing
  initiatePayment: (amount: number, currency: string, orderId: string) => Promise<string>
  checkPaymentStatus: (paymentId: string) => Promise<void>
  setPaymentUrl: (url: string | null) => void
  setStatus: (status: PaymentState['status']) => void
  setCurrentTransaction: (transaction: PaymentTransaction | null) => void
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearPayment: () => void
  reset: () => void
}

export const usePaymentStore = create<PaymentState & PaymentActions>()(
  persist(
    (set, get) => ({
      // Initial state
      methods: [],
      selectedMethod: null,
      transactions: [],
      currentTransaction: null,
      paymentUrl: null,
      status: 'idle',
      isLoading: false,
      error: null,
      amount: 0,
      currency: 'USD',
      targetAmount: 0,
      targetCurrency: 'USD',
      exchangeRate: 1,
      fees: 0,

      // Payment methods
      addPaymentMethod: (method) => {
        const newMethod: PaymentMethod = {
          ...method,
          id: `pm-${Date.now()}`,
          isDefault: get().methods.length === 0
        }
        set((state) => ({
          methods: [...state.methods, newMethod],
          selectedMethod: state.selectedMethod || newMethod
        }))
      },

      updatePaymentMethod: (id, updates) => {
        set((state) => ({
          methods: state.methods.map(method =>
            method.id === id ? { ...method, ...updates } : method
          ),
          selectedMethod: state.selectedMethod?.id === id
            ? { ...state.selectedMethod, ...updates }
            : state.selectedMethod
        }))
      },

      removePaymentMethod: (id) => {
        set((state) => ({
          methods: state.methods.filter(method => method.id !== id),
          selectedMethod: state.selectedMethod?.id === id ? null : state.selectedMethod
        }))
      },

      setDefaultMethod: (id) => {
        set((state) => ({
          methods: state.methods.map(method => ({
            ...method,
            isDefault: method.id === id
          }))
        }))
      },

      selectMethod: (method) => {
        set({ selectedMethod: method })
      },

      // Transactions
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [...state.transactions, transaction],
          currentTransaction: transaction
        }))
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map(transaction =>
            transaction.id === id ? { ...transaction, ...updates } : transaction
          ),
          currentTransaction: state.currentTransaction?.id === id
            ? { ...state.currentTransaction, ...updates }
            : state.currentTransaction
        }))
      },

      getTransaction: (id) => {
        return get().transactions.find(transaction => transaction.id === id)
      },

      // Payment processing
      initiatePayment: async (amount, currency, orderId) => {
        set({ status: 'pending', isLoading: true })
        try {
          // In a real application, you would call an API here
          // For demonstration, we'll simulate a payment URL generation
          const paymentUrl = `https://example.com/payment/${orderId}`
          set({ paymentUrl })
          return paymentUrl
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ status: 'failed', error: errorMessage })
          throw error
        } finally {
          set({ status: 'completed', isLoading: false })
        }
      },

      checkPaymentStatus: async (paymentId) => {
        set({ isLoading: true })
        try {
          // In a real application, you would call an API here
          // For demonstration, we'll simulate checking payment status
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Simulate random status updates
          const statuses: Array<'pending' | 'completed' | 'failed'> = ['pending', 'completed', 'failed']
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
          
          set({ status: randomStatus })
        } catch (error) {
          set({ status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' })
        } finally {
          set({ isLoading: false })
        }
      },

      setPaymentUrl: (url) => {
        set({ paymentUrl: url })
      },

      setStatus: (status) => {
        set({ status })
      },

      setCurrentTransaction: (transaction) => {
        set({ currentTransaction: transaction })
      },

      // State management
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      clearPayment: () => {
        set({
          paymentUrl: null,
          status: 'idle',
          currentTransaction: null,
          error: null,
          amount: 0,
          currency: 'USD',
          targetAmount: 0,
          targetCurrency: 'USD',
          exchangeRate: 1,
          fees: 0
        })
      },

      reset: () => {
        set({
          methods: [],
          selectedMethod: null,
          transactions: [],
          currentTransaction: null,
          paymentUrl: null,
          status: 'idle',
          isLoading: false,
          error: null,
          amount: 0,
          currency: 'USD',
          targetAmount: 0,
          targetCurrency: 'USD',
          exchangeRate: 1,
          fees: 0
        })
      }
    }),
    {
      name: 'payment-storage',
      partialize: (state) => ({
        methods: state.methods,
        selectedMethod: state.selectedMethod,
        transactions: state.transactions
      })
    }
  )
) 
