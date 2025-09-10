import { useState, useCallback } from 'react'
import { ShippingRate, ShippingAddress, ShippingPackage, TrackingInfo } from '@/lib/services/logistics.service'

interface UseLogisticsReturn {
  rates: ShippingRate[]
  trackingInfo: TrackingInfo | null
  loading: boolean
  error: string | null
  getRates: (fromAddress: ShippingAddress, toAddress: ShippingAddress, packages: ShippingPackage[]) => Promise<boolean>
  getTrackingInfo: (trackingNumber: string, carrierCode: string) => Promise<boolean>
  clearRates: () => void
  clearTrackingInfo: () => void
  clearError: () => void
}

export function useLogistics(): UseLogisticsReturn {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRates = useCallback(async (
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          packages
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get shipping rates')
      }

      if (data.success) {
        setRates(data.data)
        return true
      } else {
        throw new Error(data.error || 'Failed to get shipping rates')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get shipping rates'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getTrackingInfo = useCallback(async (
    trackingNumber: string,
    carrierCode: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/shipping/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber,
          carrierCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tracking information')
      }

      if (data.success) {
        setTrackingInfo(data.data)
        return true
      } else {
        throw new Error(data.error || 'Failed to get tracking information')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get tracking information'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clearRates = useCallback(() => {
    setRates([])
  }, [])

  const clearTrackingInfo = useCallback(() => {
    setTrackingInfo(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    rates,
    trackingInfo,
    loading,
    error,
    getRates,
    getTrackingInfo,
    clearRates,
    clearTrackingInfo,
    clearError
  }
}
