'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  isOwn: boolean
}

interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  participants: ChatParticipant[]
  currentUserId: string
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file') => void
  onTyping?: (isTyping: boolean) => void
  onCall?: (type: 'audio' | 'video') => void
  onSearch?: (query: string) => void
  className?: string
}

export default function ChatInterface({
  messages,
  participants,
  currentUserId,
  onSendMessage,
  onTyping,
  onCall,
  onSearch,
  className = ''
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUser = participants.find(p => p.id === currentUserId)
  const otherParticipants = participants.filter(p => p.id !== currentUserId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        onTyping?.(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isTyping, onTyping])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    onSendMessage(newMessage.trim())
    setNewMessage('')
    setIsTyping(false)
    onTyping?.(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else {
      if (!isTyping) {
        setIsTyping(true)
        onTyping?.(true)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // Handle file upload logic here
      const file = files[0]
      onSendMessage(`Uploaded: ${file.name}`, 'file')
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return '✓'
      case 'delivered':
        return '✓✓'
      case 'read':
        return '✓✓'
      case 'failed':
        return '✗'
      default:
        return ''
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-md ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Participants Avatars */}
          <div className="flex -space-x-2">
            {otherParticipants.slice(0, 3).map((participant, index) => (
              <div key={participant.id} className="relative">
                {participant.avatar ? (
                  <Image
                    src={participant.avatar}
                    alt={participant.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  participant.status === 'online' ? 'bg-green-500' : 
                  participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
              </div>
            ))}
            {otherParticipants.length > 3 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                +{otherParticipants.length - 3}
              </div>
            )}
          </div>

          {/* Chat Info */}
          <div>
            <h3 className="font-medium text-gray-900">
              {otherParticipants.length === 1 
                ? otherParticipants[0].name 
                : `${otherParticipants.length} participants`
              }
            </h3>
            <p className="text-sm text-gray-500">
              {otherParticipants.filter(p => p.status === 'online').length} online
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {onSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearch('')}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          {onCall && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCall('audio')}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCall('video')}
              >
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
              message.isOwn ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {/* Avatar */}
              {!message.isOwn && (
                <div className="flex-shrink-0">
                  {message.senderAvatar ? (
                    <Image
                      src={message.senderAvatar}
                      alt={message.senderName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`flex flex-col ${
                message.isOwn ? 'items-end' : 'items-start'
              }`}>
                {!message.isOwn && (
                  <span className="text-xs text-gray-500 mb-1">
                    {message.senderName}
                  </span>
                )}
                
                <div className={`px-4 py-2 rounded-lg max-w-full ${
                  message.isOwn
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.type === 'image' ? (
                    <Image
                      src={message.content}
                      alt="Message image"
                      width={300}
                      height={200}
                      className="max-w-full rounded"
                    />
                  ) : message.type === 'file' ? (
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{message.content}</span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {/* Message Status */}
                <div className={`flex items-center gap-1 mt-1 ${
                  message.isOwn ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.isOwn && (
                    <span className={`text-xs ${
                      message.status === 'failed' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {getMessageStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-xs text-gray-500">typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          {/* File Upload */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Emoji Picker */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-8 gap-1">
              {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji)
                    setShowEmojiPicker(false)
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
