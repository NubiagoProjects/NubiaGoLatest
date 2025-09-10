'use client'

import { useEffect, useState } from 'react'

interface SimpleLoadingProps {
  timeout?: number
  onTimeout?: () => void
}

export function SimpleLoading({ timeout = 10000, onTimeout }: SimpleLoadingProps) {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true)
      onTimeout?.()
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, onTimeout])

  if (showFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <div className="w-12 h-12 bg-white rounded-full animate-spin"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Taking longer than expected...
          </h2>
          
          <p className="text-gray-600 text-lg">We&apos;re loading your content...</p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh Page
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>If the problem persists, please contact support.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-16 h-16 bg-white rounded-2xl animate-spin"></div>
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-3xl animate-spin mx-auto"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Loading NubiaGo...
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Please wait while we prepare your shopping experience
          </p>
        </div>

        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
