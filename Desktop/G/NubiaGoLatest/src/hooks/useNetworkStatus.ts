'use client'

import { useState, useEffect } from 'react'

export type NetworkQuality = 'offline' | 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
export type DataSaverMode = 'off' | 'auto' | 'aggressive'

interface NetworkInfo {
  online: boolean
  quality: NetworkQuality
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

interface NetworkStatusHook {
  networkInfo: NetworkInfo
  dataSaverMode: DataSaverMode
  setDataSaverMode: (mode: DataSaverMode) => void
  isSlowConnection: boolean
  shouldOptimizeImages: boolean
  shouldPreloadContent: boolean
  estimatedSpeed: number // Mbps
}

export function useNetworkStatus(): NetworkStatusHook {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    online: true,
    quality: 'unknown',
  })
  
  const [dataSaverMode, setDataSaverMode] = useState<DataSaverMode>('auto')

  useEffect(() => {
    const updateNetworkInfo = () => {
      if (typeof window === 'undefined') return
      
      const navigator = window.navigator as any
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

      let quality: NetworkQuality = 'unknown'
      let effectiveType = connection?.effectiveType || undefined
      let downlink = connection?.downlink || undefined
      let rtt = connection?.rtt || undefined
      let saveData = connection?.saveData || false

      // Determine network quality
      if (!navigator.onLine) {
        quality = 'offline'
      } else if (connection) {
        switch (effectiveType) {
          case 'slow-2g':
            quality = 'slow-2g'
            break
          case '2g':
            quality = '2g'
            break
          case '3g':
            quality = '3g'
            break
          case '4g':
            quality = '4g'
            break
          default:
            // Fallback based on downlink speed
            if (downlink < 0.15) quality = 'slow-2g'
            else if (downlink < 0.5) quality = '2g'
            else if (downlink < 1.5) quality = '3g'
            else quality = '4g'
        }
      }

      setNetworkInfo({
        online: navigator.onLine,
        quality,
        effectiveType,
        downlink,
        rtt,
        saveData,
      })
    }

    // Initial check
    updateNetworkInfo()

    // Listen for network changes
    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    // Listen for connection changes (if supported)
    const navigator = window.navigator as any
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection && typeof connection.addEventListener === 'function') {
      try {
        connection.addEventListener('change', updateNetworkInfo)
      } catch (error) {
        console.warn('Failed to add connection change listener:', error)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', updateNetworkInfo)
        window.removeEventListener('offline', updateNetworkInfo)
      }
      if (connection && typeof connection.removeEventListener === 'function') {
        try {
          connection.removeEventListener('change', updateNetworkInfo)
        } catch (error) {
          console.warn('Failed to remove connection change listener:', error)
        }
      }
    }
  }, [])

  // Load data saver preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('dataSaverMode')
        if (saved && ['off', 'auto', 'aggressive'].includes(saved)) {
          setDataSaverMode(saved as DataSaverMode)
        }
      } catch (error) {
        console.warn('Failed to load data saver mode from localStorage:', error)
      }
    }
  }, [])

  // Save data saver preference
  const handleSetDataSaverMode = (mode: DataSaverMode) => {
    setDataSaverMode(mode)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dataSaverMode', mode)
      } catch (error) {
        console.warn('Failed to save data saver mode to localStorage:', error)
      }
    }
  }

  // Derived states
  const isSlowConnection = ['offline', 'slow-2g', '2g'].includes(networkInfo.quality)
  
  const shouldOptimizeImages = 
    dataSaverMode === 'aggressive' ||
    (dataSaverMode === 'auto' && (isSlowConnection || Boolean(networkInfo.saveData)))

  const shouldPreloadContent = 
    dataSaverMode === 'off' && 
    !isSlowConnection && 
    !Boolean(networkInfo.saveData) &&
    networkInfo.quality === '4g'

  // Estimate speed in Mbps
  const estimatedSpeed = networkInfo.downlink || (() => {
    switch (networkInfo.quality) {
      case 'offline': return 0
      case 'slow-2g': return 0.05
      case '2g': return 0.25
      case '3g': return 1.0
      case '4g': return 5.0
      default: return 1.0
    }
  })()

  return {
    networkInfo,
    dataSaverMode,
    setDataSaverMode: handleSetDataSaverMode,
    isSlowConnection,
    shouldOptimizeImages,
    shouldPreloadContent,
    estimatedSpeed,
  }
}

// Hook for monitoring data usage
export function useDataUsageTracker() {
  const [dataUsed, setDataUsed] = useState(0) // in KB
  const [sessionStart] = useState(Date.now())

  const trackDataUsage = (bytes: number) => {
    setDataUsed(prev => prev + bytes / 1024) // Convert to KB
  }

  const getSessionDuration = () => {
    return Math.floor((Date.now() - sessionStart) / 1000) // in seconds
  }

  const getAverageSpeed = () => {
    const duration = getSessionDuration()
    return duration > 0 ? (dataUsed * 8) / duration : 0 // Kbps
  }

  const resetUsage = () => {
    setDataUsed(0)
  }

  return {
    dataUsed,
    sessionDuration: getSessionDuration(),
    averageSpeed: getAverageSpeed(),
    trackDataUsage,
    resetUsage,
  }
}
