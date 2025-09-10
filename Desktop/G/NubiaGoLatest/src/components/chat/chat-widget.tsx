'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chat'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
// import { ChatUser, ChatChannel, ChatMessage } from '@/lib/sendbird'
// Use fallback types for ChatUser, ChatChannel, and ChatMessage

type ChatUser = any
// Define minimal fallback types
interface ChatChannel {
  id: string
  name: string
  channelUrl?: string
}
type ChatMessage = any
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

// ============================================================================
// CHAT WIDGET TYPES
// ============================================================================

interface ChatWidgetProps {
  orderId?: string
  channelUrl?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark'
  showNotifications?: boolean
}

interface MessageInputProps {
  onSend: (message: string) => void
  onFileUpload?: (file: File) => void
  placeholder?: string
  disabled?: boolean
}

interface MessageBubbleProps {
  message: ChatMessage
  isOwnMessage: boolean
  onReply?: (message: ChatMessage) => void
  onDelete?: (messageId: string) => void
}

// ============================================================================
// MESSAGE INPUT COMPONENT
// ============================================================================

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onFileUpload,
  placeholder = "Type your message...",
  disabled = false
}) => {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t bg-white">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
      />
      
      {onFileUpload && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </form>
  )
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onReply,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id)
    }
  }

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              {message.userId}
            </span>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.type === 'image' && (
            <img
              src={message.message}
              alt="Image"
              className="max-w-full h-auto rounded"
            />
          )}
          
          {message.type === 'file' && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">File attached</span>
            </div>
          )}
          
          {message.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
        
        {showActions && (
          <div className={`absolute top-0 ${isOwnMessage ? 'left-0' : 'right-0'} transform -translate-y-full bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10`}>
            <button
              onClick={handleReply}
              className="block w-full px-2 py-1 text-sm text-left text-gray-700 hover:bg-gray-100 rounded"
            >
              Reply
            </button>
            {isOwnMessage && onDelete && (
              <button
                onClick={handleDelete}
                className="block w-full px-2 py-1 text-sm text-left text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CHAT WIDGET COMPONENT
// ============================================================================

const ChatWidget: React.FC<ChatWidgetProps> = ({
  orderId,
  channelUrl,
  isOpen = false,
  onToggle,
  position = 'bottom-right',
  theme = 'light',
  showNotifications = true
}) => {
  const { user } = useFirebaseAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyTo, setReplyTo] = useState<any>(null)

  // Mock data
  const isAuthenticated = !!user
  const messages: any[] = []
  const unreadCount = 0
  const currentChannel = channelUrl ? { 
    id: 'mock-channel', 
    name: 'Mock Channel', 
    channelUrl,
    participants: []
  } : null

  // ============================================================================
  // POSITION CLASSES
  // ============================================================================

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user) return

    console.log('Sending message:', messageText)
    // Mock implementation
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return

    console.log('Uploading file:', file.name)
    // Mock implementation
  }

  const handleReply = (message: any) => {
    setReplyTo(message)
  }

  const handleDeleteMessage = async (messageId: string) => {
    console.log('Deleting message:', messageId)
    // Mock implementation
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => onToggle?.(true)}
          className={`relative p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors ${
            theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : ''
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          {showNotifications && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`w-80 h-96 bg-white rounded-lg shadow-xl border ${
          theme === 'dark' ? 'bg-gray-800 text-white' : ''
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h3 className="font-semibold">
                {currentChannel?.name || 'Chat'}
              </h3>
              {currentChannel && currentChannel.participants && (
                <p className="text-sm text-gray-500">
                  {currentChannel.participants.length} participants
                </p>
              )}
            </div>
            <button
              onClick={() => onToggle?.(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 h-64 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                {error}
              </div>
            ) : (
              <div>
                {currentChannel && currentChannel.channelUrl && messages?.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.userId === user?.uid}
                    onReply={handleReply}
                    onDelete={handleDeleteMessage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Reply Preview */}
          {replyTo && (
            <div className={`px-4 py-2 border-t ${
              theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Replying to {replyTo.userId}</span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 truncate">{replyTo.message}</p>
            </div>
          )}

          {/* Message Input */}
          <MessageInput
            onSend={sendMessage}
            onFileUpload={handleFileUpload}
            placeholder="Type your message..."
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  )
}

export default ChatWidget 
