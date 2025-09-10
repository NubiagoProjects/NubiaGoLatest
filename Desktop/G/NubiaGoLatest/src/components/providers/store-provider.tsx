'use client'

import { useEffect, useState } from 'react'
import { useSearchHistoryStore } from '@/store/search-history'
import { Loading } from '@/components/ui/loading'

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setIsHydrated(true)
      return
    }

    // Initialize stores with comprehensive error handling
    const initializeStores = async () => {
      try {
        // Check if localStorage is available and accessible
        if (!window.localStorage) {
          console.warn('localStorage not available, skipping store rehydration')
          setIsHydrated(true)
          return
        }

        // Test localStorage access
        try {
          const testKey = '__zustand_test__'
          window.localStorage.setItem(testKey, 'test')
          window.localStorage.removeItem(testKey)
        } catch (error) {
          console.warn('localStorage access blocked, skipping store rehydration:', error)
          setIsHydrated(true)
          return
        }

        // Add a very short timeout to prevent long loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Store rehydration timeout')), 800)
        )
        
        const rehydratePromise = useSearchHistoryStore.persist.rehydrate()
        
        await Promise.race([rehydratePromise, timeoutPromise])
        setIsHydrated(true)
        setError(null)
      } catch (error) {
        console.warn('Store rehydration failed or timed out:', error)
        setError('Continuing without persistence')
        // Continue anyway to prevent infinite loading
        setIsHydrated(true)
      }
    }

    // Very short fallback timeout to ensure we never get stuck
    const fallbackTimeout = setTimeout(() => {
      console.warn('Store provider fallback timeout - forcing hydration')
      setError('Continuing without persistence')
      setIsHydrated(true)
    }, 1200)

    initializeStores()

    return () => clearTimeout(fallbackTimeout)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
              <div className="w-16 h-16 bg-white rounded-2xl animate-spin"></div>
            </div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-primary-600 border-r-secondary-600 rounded-3xl animate-spin mx-auto"></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Initializing...
            </h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              Setting up your shopping experience
            </p>
          </div>
          
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-secondary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {children}
    </>
  )
}
