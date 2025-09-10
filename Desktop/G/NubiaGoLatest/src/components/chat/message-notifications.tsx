'use client'

import React, { useState, useEffect } from 'react'
import { useChatStore } from '@/store/chat'
import { ChatNotification } from '@/store/chat'
import { BellIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

// ============================================================================
// MESSAGE NOTIFICATIONS TYPES
// ============================================================================

interface MessageNotificationsProps {
  maxNotifications?: number
  autoHide?: boolean
  hideDelay?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  theme?: 'light' | 'dark'
}

interface NotificationItemProps {
  notification: ChatNotification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  theme?: 'light' | 'dark'
}

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
  theme = 'light'
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    onDismiss(notification.id)
    setIsVisible(false)
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!isVisible) return null

  return (
    <div
      className={`mb-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'
          }`}>
            <ChatBubbleLeftRightIcon className={`w-4 h-4 ${
              theme === 'dark' ? 'text-white' : 'text-blue-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              {notification.title}
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatTime(notification.timestamp)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleMarkAsRead}
            className={`p-1 rounded hover:bg-opacity-80 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title="Mark as read"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          
          <button
            onClick={handleDismiss}
            className={`p-1 rounded hover:bg-opacity-80 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title="Dismiss"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MESSAGE NOTIFICATIONS COMPONENT
// ============================================================================

const MessageNotifications: React.FC<MessageNotificationsProps> = ({
  maxNotifications = 5,
  autoHide = true,
  hideDelay = 5000,
  position = 'top-right',
  theme = 'light'
}) => {
  // Mock data since these properties don't exist in the store
  const notifications: any[] = []
  const unreadCount = notifications.filter(n => !n.isRead).length
  const markNotificationAsRead = (id: string) => {
    console.log('Mark notification as read:', id)
  }
  const clearNotifications = () => {
    console.log('Clear notifications')
  }

  const [isVisible, setIsVisible] = useState(false)
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  // ============================================================================
  // POSITION CLASSES
  // ============================================================================

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (unreadCount > 0) {
      setIsVisible(true)
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, hideDelay)
        
        return () => clearTimeout(timer)
      }
    }
  }, [unreadCount, autoHide, hideDelay])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  const handleDismiss = (id: string) => {
    setDismissedNotifications(prev => new Set(Array.from(prev).concat(id)))
  }

  const handleClearAll = () => {
    clearNotifications()
    setDismissedNotifications(new Set())
  }

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  // ============================================================================
  // FILTER NOTIFICATIONS
  // ============================================================================

  const visibleNotifications = notifications
    .filter(notification => !dismissedNotifications.has(notification.id))
    .slice(0, maxNotifications)

  // ============================================================================
  // RENDER
  // ============================================================================

  if (unreadCount === 0) {
    return null
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Notification Toggle Button */}
      <button
        onClick={handleToggleVisibility}
        className={`relative p-3 rounded-full shadow-lg transition-colors ${
          theme === 'dark'
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isVisible && (
        <div className={`mt-2 w-80 max-h-96 overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        } rounded-lg shadow-xl border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Notifications ({unreadCount})
            </h3>
            <button
              onClick={handleClearAll}
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clear all
            </button>
          </div>

          {/* Notifications List */}
          <div className="p-4">
            {visibleNotifications.length === 0 ? (
              <div className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                  theme={theme}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageNotifications 
