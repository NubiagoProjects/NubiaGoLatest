import React, { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/utils/logger'

interface PWAState {
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  pushSubscription: PushSubscription | null
}

interface PWAOptions {
  onUpdate?: () => void
  onInstall?: () => void
  onPushNotification?: (payload: any) => void
}

export function usePWA(options: PWAOptions = {}) {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isUpdateAvailable: false,
    registration: null,
    pushSubscription: null,
  })

  // Check if app is installed
  const checkInstallation = useCallback(() => {
    if ('standalone' in window.navigator) {
      setState(prev => ({ ...prev, isInstalled: (window.navigator as any).standalone }))
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      setState(prev => ({ ...prev, isInstalled: true }))
    }
  }, [])

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        logger.log('Service Worker registered:', registration)

        setState(prev => ({ ...prev, registration }))

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker?.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }))
                options.onUpdate?.()
              }
            })
          }
        })

        // Handle service worker updates
        if (navigator.serviceWorker) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            logger.log('Service Worker updated')
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          })
        }

        return registration
      } catch (error) {
        logger.error('Service Worker registration failed:', error)
      }
    }
  }, [options.onUpdate])

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if (!state.registration) return null

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const subscription = await state.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '') as BufferSource
        })

        setState(prev => ({ ...prev, pushSubscription: subscription }))
        return subscription
      }
    } catch (error) {
              logger.error('Push notification permission failed:', error)
    }

    return null
  }, [state.registration])

  // Send push notification
  const sendPushNotification = useCallback(async (title: string, options: NotificationOptions = {}) => {
    if (!state.registration) return

    try {
      await state.registration.showNotification(title, {
        icon: '/ui-logo-1.jpg',
        badge: '/ui-logo-1.jpg',
        ...options
      })
    } catch (error) {
              logger.error('Failed to show notification:', error)
    }
  }, [state.registration])

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [state.registration])

  // Install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const showInstallPrompt = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
              logger.log('Install prompt outcome:', outcome)
      setDeferredPrompt(null)
      return outcome === 'accepted'
    }
    return false
  }, [deferredPrompt])

  // Initialize PWA
  useEffect(() => {
    // Check installation status
    checkInstallation()

    // Register service worker
    registerServiceWorker()

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true }))
      options.onInstall?.()
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
          options.onPushNotification?.(event.data.payload)
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [checkInstallation, registerServiceWorker, options])

  return {
    ...state,
    registerServiceWorker,
    requestPushPermission,
    sendPushNotification,
    updateServiceWorker,
    showInstallPrompt,
    canInstall: !!deferredPrompt,
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// PWA Install Prompt Component
export function PWAInstallPrompt() {
  const { canInstall, showInstallPrompt, isInstalled } = usePWA()

  if (isInstalled || !canInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-lg">📱</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Install NubiaGo</h3>
            <p className="text-sm text-gray-600">Get the app for a better experience</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={showInstallPrompt}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

// PWA Update Prompt Component
export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateServiceWorker } = usePWA()

  if (!isUpdateAvailable) return null

  return (
    <div className="fixed top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-yellow-600">🔄</span>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900">Update Available</h3>
            <p className="text-sm text-yellow-700">A new version is ready to install</p>
          </div>
        </div>
        <button
          onClick={updateServiceWorker}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  )
}

// Offline Indicator Component
export function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <span className="text-red-600">📶</span>
        </div>
        <div>
          <h3 className="font-semibold text-red-900">You're Offline</h3>
          <p className="text-sm text-red-700">Some features may not be available</p>
        </div>
      </div>
    </div>
  )
} 
