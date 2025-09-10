import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logisticsService, ShippingRate, ShippingAddress, ShippingPackage, TrackingInfo } from '@/lib/services/logistics.service'
import { logger } from '@/lib/utils/logger'

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  isAvailable: boolean
}

export interface ShippingLabel {
  id: string
  trackingNumber: string
  labelUrl: string
  labelFormat: 'pdf' | 'png' | 'zpl'
  carrier: string
  serviceCode: string
  createdAt: Date
}

interface ShippingState {
  addresses: ShippingAddress[]
  selectedAddress: ShippingAddress | null
  shippingMethods: ShippingMethod[]
  selectedMethod: ShippingMethod | null
  selectedRate: ShippingRate | null
  labels: ShippingLabel[]
  isLoading: boolean
  error: string | null
  // Rate calculation properties
  rates: ShippingRate[]
  ratesLoading: boolean
  ratesError: string | null
  // Tracking properties
  trackingInfo: TrackingInfo | null
  trackingLoading: boolean
  trackingError: string | null
}

interface ShippingActions {
  // Address management
  addAddress: (address: Omit<ShippingAddress, 'id'>) => void
  updateAddress: (id: string, updates: Partial<ShippingAddress>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  selectAddress: (address: ShippingAddress | null) => void
  
  // Shipping methods
  setShippingMethods: (methods: ShippingMethod[]) => void
  selectShippingMethod: (method: ShippingMethod | null) => void
  selectRate: (rate: ShippingRate | null) => void
  
  // Rate calculation
  getRates: (data: {
    fromAddress: ShippingAddress
    toAddress: ShippingAddress
    packages: ShippingPackage[]
  }) => Promise<boolean>
  clearRates: () => void
  
  // Tracking
  getTrackingInfo: (trackingNumber: string, carrierCode?: string) => Promise<boolean>
  clearTrackingInfo: () => void
  
  // Labels
  addLabel: (label: ShippingLabel) => void
  getLabel: (id: string) => ShippingLabel | undefined
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

export const useShippingStore = create<ShippingState & ShippingActions>()(
  persist(
    (set, get) => ({
      // Initial state
      addresses: [],
      selectedAddress: null,
      shippingMethods: [],
      selectedMethod: null,
      selectedRate: null,
      labels: [],
      isLoading: false,
      error: null,
      // Rate calculation state
      rates: [],
      ratesLoading: false,
      ratesError: null,
      trackingInfo: null,
      trackingLoading: false,
      trackingError: null,

      // Address management
      addAddress: (address) => {
        const newAddress: ShippingAddress = {
          ...address,
          id: `addr-${Date.now()}`,
          isDefault: get().addresses.length === 0
        }
        set((state) => ({
          addresses: [...state.addresses, newAddress],
          selectedAddress: state.selectedAddress || newAddress
        }))
      },

      updateAddress: (id, updates) => {
        set((state) => ({
          addresses: state.addresses.map(addr =>
            addr.id === id ? { ...addr, ...updates } : addr
          ),
          selectedAddress: state.selectedAddress?.id === id
            ? { ...state.selectedAddress, ...updates }
            : state.selectedAddress
        }))
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter(addr => addr.id !== id),
          selectedAddress: state.selectedAddress?.id === id ? null : state.selectedAddress
        }))
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
          }))
        }))
      },

      selectAddress: (address) => {
        set({ selectedAddress: address })
      },

      // Shipping methods
      setShippingMethods: (methods) => {
        set({ shippingMethods: methods })
      },

      selectShippingMethod: (method) => {
        set({ selectedMethod: method })
      },

      selectRate: (rate) => {
        set({ selectedRate: rate })
      },

      // Rate calculation - NOW USING REAL LOGISTICS SERVICE
      getRates: async (data) => {
        set({ ratesLoading: true, ratesError: null })
        try {
          // Use the real logistics service
          const rates = await logisticsService.getShippingRates(
            data.fromAddress,
            data.toAddress,
            data.packages
          )
          
          set({ rates, ratesLoading: false })
          return true
        } catch (error: any) {
          logger.error('Failed to get shipping rates:', error)
          set({ ratesError: error.message || 'Failed to calculate rates', ratesLoading: false })
          return false
        }
      },

      clearRates: () => {
        set({ rates: [], ratesError: null })
      },

      // Tracking - NOW USING REAL LOGISTICS SERVICE
      getTrackingInfo: async (trackingNumber, carrierCode) => {
        set({ trackingLoading: true, trackingError: null })
        try {
          if (!carrierCode) {
            throw new Error('Carrier code is required for tracking')
          }

          // Use the real logistics service
          const trackingInfo = await logisticsService.getTrackingInfo(trackingNumber, carrierCode)
          
          if (!trackingInfo) {
            throw new Error('Tracking information not found')
          }

          set({ trackingInfo, trackingLoading: false })
          return true
        } catch (error: any) {
          logger.error('Failed to get tracking info:', error)
          set({ ratesError: error.message || 'Failed to get tracking info', trackingLoading: false })
          return false
        }
      },

      clearTrackingInfo: () => {
        set({ trackingInfo: null, trackingError: null })
      },

      // Labels
      addLabel: (label) => {
        set((state) => ({
          labels: [...state.labels, label]
        }))
      },

      getLabel: (id) => {
        return get().labels.find(label => label.id === id)
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

      reset: () => {
        set({
          addresses: [],
          selectedAddress: null,
          shippingMethods: [],
          selectedMethod: null,
          selectedRate: null,
          labels: [],
          isLoading: false,
          error: null,
          rates: [],
          ratesLoading: false,
          ratesError: null,
          trackingInfo: null,
          trackingLoading: false,
          trackingError: null,
        })
      },
    }),
    {
      name: 'shipping-storage',
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddress: state.selectedAddress,
        shippingMethods: state.shippingMethods,
        selectedMethod: state.selectedMethod,
        labels: state.labels,
      }),
    }
  )
) 
