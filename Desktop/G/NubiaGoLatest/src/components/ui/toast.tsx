'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  AlertTriangle
} from 'lucide-react'
import { useToastStore } from '@/store/toast'

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

// ============================================================================
// TOAST ICONS
// ============================================================================

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
}

// ============================================================================
// TOAST COMPONENT
// ============================================================================

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const colors = toastColors[toast.type]
  const Icon = toastIcons[toast.type]

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleClose = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(toast.id)
      toast.onClose?.()
    }, 300)
  }, [toast.id, onRemove, toast.onClose])

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className={`
        max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto
        border ${colors.border} ${colors.bg}
        overflow-hidden
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${colors.title}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`mt-1 text-sm ${colors.message}`}>
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      toast.action?.onClick()
                      handleClose()
                    }}
                    className={`text-sm font-medium ${colors.title} hover:${colors.title.replace('text-', 'text-')} underline`}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className={`inline-flex ${colors.icon} hover:${colors.icon.replace('text-', 'text-')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${colors.icon.replace('text-', '')} rounded-md`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  // Only render if we're in the browser
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <>
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}

// Add a toast function for backward compatibility
export const toast = {
  success: (title: string, message?: string) => {
    if (typeof window === 'undefined') {
      console.log('Toast (success):', title, message)
      return
    }
    try {
      const { addToast } = useToastStore.getState()
      addToast({
        type: 'success',
        title,
        message,
        duration: 5000
      })
    } catch (error) {
      console.error('Toast error:', error)
    }
  },
  error: (title: string, message?: string) => {
    if (typeof window === 'undefined') {
      console.error('Toast (error):', title, message)
      return
    }
    try {
      const { addToast } = useToastStore.getState()
      addToast({
        type: 'error',
        title,
        message,
        duration: 7000
      })
    } catch (error) {
      console.error('Toast error:', error)
    }
  },
  warning: (title: string, message?: string) => {
    if (typeof window === 'undefined') {
      console.warn('Toast (warning):', title, message)
      return
    }
    try {
      const { addToast } = useToastStore.getState()
      addToast({
        type: 'warning',
        title,
        message,
        duration: 6000
      })
    } catch (error) {
      console.error('Toast error:', error)
    }
  },
  info: (title: string, message?: string) => {
    if (typeof window === 'undefined') {
      console.info('Toast (info):', title, message)
      return
    }
    try {
      const { addToast } = useToastStore.getState()
      addToast({
        type: 'info',
        title,
        message,
        duration: 5000
      })
    } catch (error) {
      console.error('Toast error:', error)
    }
  }
}

// ============================================================================
// TOAST HOOK
// ============================================================================

export function useToast() {
  const { addToast } = useToastStore()

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    if (typeof window === 'undefined') {
      console.log('Toast:', options)
      return
    }
    const id = Math.random().toString(36).substr(2, 9)
    addToast({ ...options })
  }, [addToast])

  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    toast({ type: 'success', title, message, ...options })
  }, [toast])

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    toast({ type: 'error', title, message, ...options })
  }, [toast])

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    toast({ type: 'warning', title, message, ...options })
  }, [toast])

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    toast({ type: 'info', title, message, ...options })
  }, [toast])

  return { toast, success, error, warning, info }
}

// ============================================================================
// TOAST PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}

// ============================================================================
// TOAST UTILITIES - REMOVED DUE TO HOOK RULES VIOLATION
// ============================================================================
// Note: These utility functions were removed because they violate React Hook rules.
// Use the useToast hook directly in your components instead.

// ============================================================================
// TOAST COMPONENTS FOR COMMON USE CASES
// ============================================================================

export function NetworkErrorToast() {
  const { error } = useToast()
  
  useEffect(() => {
    error(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection.',
      { duration: 5000 }
    )
  }, [error])

  return null
}

export function FormErrorToast({ errors }: { errors: string[] }) {
  const { error } = useToast()
  
  useEffect(() => {
    if (errors.length > 0) {
      error(
        'Form Validation Error',
        errors.join(', '),
        { duration: 4000 }
      )
    }
  }, [errors, error])

  return null
}

export function SuccessActionToast({ message }: { message: string }) {
  const { success } = useToast()
  
  useEffect(() => {
    success('Success', message, { duration: 3000 })
  }, [message, success])

  return null
}

// ============================================================================
// TOAST ANIMATIONS
// ============================================================================

export const toastAnimations = {
  enter: 'transform transition-all duration-300 ease-out translate-x-0 opacity-100',
  exit: 'transform transition-all duration-300 ease-in translate-x-full opacity-0',
  slideIn: 'animate-slide-in-right',
  slideOut: 'animate-slide-out-right',
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
}

// ============================================================================
// TOAST POSITIONS
// ============================================================================

export const toastPositions = {
  'top-right': 'fixed top-4 right-4',
  'top-left': 'fixed top-4 left-4',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'fixed bottom-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
}

// ============================================================================
// TOAST DEFAULTS
// ============================================================================

export const toastDefaults = {
  duration: 4000,
  position: 'top-right' as keyof typeof toastPositions,
  maxToasts: 5,
}

// ============================================================================
// TOAST MANAGER
// ============================================================================

export class ToastManager {
  private static instance: ToastManager
  private toasts: Toast[] = []

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  add(toast: Toast): void {
    this.toasts.push(toast)
    if (this.toasts.length > toastDefaults.maxToasts) {
      this.toasts.shift()
    }
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
  }

  clear(): void {
    this.toasts = []
  }

  getToasts(): Toast[] {
    return [...this.toasts]
  }
} 
