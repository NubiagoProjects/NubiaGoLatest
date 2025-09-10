'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Headphones, Video, Phone, Search, Shield, Clock, CheckCircle } from 'lucide-react'
import ChatInterface from '@/components/chat/chat-interface'

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading chat data
    setTimeout(() => {
      setParticipants([
        {
          id: 'user1',
          name: 'Enterprise Support Team',
          status: 'online'
        },
        {
          id: 'current-user',
          name: 'You',
          status: 'online'
        }
      ])

      setMessages([
        {
          id: '1',
          senderId: 'user1',
          senderName: 'Enterprise Support Team',
          content: 'Welcome to NubiaGo Enterprise Support! How can we assist you today?',
          timestamp: new Date('2024-01-20T10:00:00'),
          type: 'text',
          status: 'read',
          isOwn: false
        },
        {
          id: '2',
          senderId: 'current-user',
          senderName: 'You',
          content: 'Hello! I have a question about your enterprise features.',
          timestamp: new Date('2024-01-20T10:01:00'),
          type: 'text',
          status: 'read',
          isOwn: true
        },
        {
          id: '3',
          senderId: 'user1',
          senderName: 'Enterprise Support Team',
          content: 'I\'d be happy to help! What specific enterprise features are you interested in?',
          timestamp: new Date('2024-01-20T10:02:00'),
          type: 'text',
          status: 'read',
          isOwn: false
        },
        {
          id: '4',
          senderId: 'current-user',
          senderName: 'You',
          content: 'I\'m looking for information about bulk ordering and corporate accounts.',
          timestamp: new Date('2024-01-20T10:03:00'),
          type: 'text',
          status: 'read',
          isOwn: true
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date(),
      type,
      status: 'sent',
      isOwn: true
    }

    setMessages(prev => [...prev, newMessage])

    // Simulate response after 2 seconds
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'user1',
        senderName: 'Enterprise Support Team',
        content: 'Perfect! I can provide you with detailed information about our enterprise solutions. Let me connect you with our enterprise specialist.',
        timestamp: new Date(),
        type: 'text',
        status: 'read',
        isOwn: false
      }
      setMessages(prev => [...prev, response])
    }, 2000)
  }

  const handleTyping = (isTyping: boolean) => {
    console.log('Typing:', isTyping)
    // Handle typing indicator
  }

  const handleCall = (type: 'audio' | 'video') => {
    console.log('Call:', type)
    // Handle call functionality
  }

  const handleSearch = (query: string) => {
    console.log('Search:', query)
    // Handle message search
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-400 rounded-full animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Connecting to enterprise support...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                Enterprise Support Chat
              </h1>
              <p className="text-xl text-gray-600">
                24/7 enterprise-grade customer support
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Support Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600">Instant messaging support</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Voice Call</h3>
            <p className="text-sm text-gray-600">Audio support available</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Video Call</h3>
            <p className="text-sm text-gray-600">Face-to-face support</p>
          </div>
        </div>

        {/* Premium Chat Interface */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Enterprise Support</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online • Responds in 2 minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <Search className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <Phone className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <Video className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-[600px]">
            <ChatInterface
              messages={messages}
              participants={participants}
              currentUserId="current-user"
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onCall={handleCall}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Premium Trust Indicators */}
        <div className="mt-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Secure Chat</div>
                <div className="text-sm text-gray-500">End-to-end encryption</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Enterprise Grade</div>
                <div className="text-sm text-gray-500">Professional support team</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">24/7 Support</div>
                <div className="text-sm text-gray-500">Always available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
