'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  loading?: boolean
}

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  actionText?: string
  onAction?: () => void
}

// ============================================================================
// MODAL SIZES
// ============================================================================

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

// ============================================================================
// MODAL ICONS
// ============================================================================

const modalIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  danger: XCircle,
}

const modalColors = {
  success: {
    icon: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  error: {
    icon: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  warning: {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  info: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  danger: {
    icon: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeOnEscape, onClose])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }, [closeOnOverlayClick, onClose])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl w-full ${modalSizes[size]} transform transition-all duration-200 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } ${className}`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================================================
// CONFIRM MODAL COMPONENT
// ============================================================================

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const Icon = modalIcons[type]
  const colors = modalColors[type]

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirmation failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        <div className={`w-12 h-12 ${colors.bg} ${colors.border} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isConfirming || loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : type === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : type === 'info'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isConfirming || loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================================================
// ALERT MODAL COMPONENT
// ============================================================================

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  actionText,
  onAction,
}: AlertModalProps) {
  const Icon = modalIcons[type]
  const colors = modalColors[type]

  const handleAction = () => {
    onAction?.()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className="text-center">
        <div className={`w-12 h-12 ${colors.bg} ${colors.border} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex justify-center">
          <button
            onClick={actionText ? handleAction : onClose}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              type === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : type === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : type === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {actionText || 'OK'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================================================
// MODAL HOOK
// ============================================================================

export function useModal() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

// ============================================================================
// MODAL UTILITIES
// ============================================================================

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void | Promise<void>
    type?: 'danger' | 'warning' | 'info' | 'success'
  } | null>(null)

  const confirm = useCallback((config: {
    title: string
    message: string
    onConfirm: () => void | Promise<void>
    type?: 'danger' | 'warning' | 'info' | 'success'
  }) => {
    setConfig(config)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setConfig(null)
  }, [])

  return {
    isOpen,
    config,
    confirm,
    close,
  }
}

// ============================================================================
// MODAL ANIMATIONS
// ============================================================================

export const modalAnimations = {
  enter: 'transform transition-all duration-200 scale-100 opacity-100',
  exit: 'transform transition-all duration-200 scale-95 opacity-0',
  backdropEnter: 'transition-opacity duration-200 opacity-100',
  backdropExit: 'transition-opacity duration-200 opacity-0',
}

// ============================================================================
// MODAL POSITIONS
// ============================================================================

export const modalPositions = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-16',
  bottom: 'items-end justify-center pb-16',
}

// ============================================================================
// MODAL TYPES
// ============================================================================

export const modalTypes = {
  default: 'bg-white',
  dark: 'bg-gray-900 text-white',
  glass: 'bg-white/80 backdrop-blur-sm',
}

// ============================================================================
// MODAL MANAGER
// ============================================================================

export class ModalManager {
  private static instance: ModalManager
  private modals: Map<string, { isOpen: boolean; config: any }> = new Map()

  static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager()
    }
    return ModalManager.instance
  }

  open(id: string, config?: any): void {
    this.modals.set(id, { isOpen: true, config })
  }

  close(id: string): void {
    this.modals.set(id, { isOpen: false, config: null })
  }

  isOpen(id: string): boolean {
    return this.modals.get(id)?.isOpen || false
  }

  getConfig(id: string): any {
    return this.modals.get(id)?.config
  }
} 
