'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useChatStore } from '@/store/chat'
import ChatWidget from '@/components/chat/chat-widget'
import MessageNotifications from '@/components/chat/message-notifications'
import AdminModeration from '@/components/chat/admin-moderation'
import {
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  HomeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/ui/Logo'

// ============================================================================
// CHAT DASHBOARD TYPES
// ============================================================================

interface ChatStats {
  totalChannels: number
  unreadMessages: number
  activeConversations: number
  pendingModeration: number
}

interface RecentChannel {
  channelUrl: string
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  participants: number
}

// ============================================================================
// CHAT DASHBOARD COMPONENT
// ============================================================================

const SupplierChatDashboard: React.FC = () => {
  const { user } = useFirebaseAuth()
  const {
    rooms,
    notifications,
    isLoading,
    setLoading,
    addNotification
  } = useChatStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'moderation' | 'notifications'>('overview')
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [stats, setStats] = useState<ChatStats>({
    totalChannels: 0,
    unreadMessages: 0,
    activeConversations: 0,
    pendingModeration: 0
  })
  const [recentChannels, setRecentChannels] = useState<RecentChannel[]>([])
  const unreadCount = notifications.filter(n => !n.isRead).length

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (user) {
      loadChannels()
      loadStats()
    }
  }, [user])

  useEffect(() => {
    // Update stats when rooms change
    updateStats()
  }, [rooms, notifications])

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadChannels = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat/sendbird', {
        headers: {
          'Authorization': `Bearer ${user.uid}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        // Mock channels data since we don't have the actual API
        const mockChannels = []
        
        // Create recent channels list
        const recent = result.data.channels?.slice(0, 5).map((channel: any) => ({
          channelUrl: channel.channelUrl,
          name: channel.name,
          lastMessage: channel.lastMessage?.message || 'No messages yet',
          lastMessageTime: channel.lastMessage?.createdAt || channel.updatedAt,
          unreadCount: 0, // This would come from Sendbird
          participants: channel.participants?.length || 0
        })) || []
        
        setRecentChannels(recent)
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!user) return

    try {
      // In a real implementation, these would come from API calls
      const mockStats: ChatStats = {
        totalChannels: rooms.length,
        unreadMessages: notifications.filter(n => !n.isRead).length,
        activeConversations: rooms.filter(r => r.lastMessage).length,
        pendingModeration: 0 // Mock value
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const updateStats = () => {
    setStats({
      totalChannels: rooms.length,
      unreadMessages: notifications.filter(n => !n.isRead).length,
      activeConversations: rooms.filter(r => r.lastMessage).length,
      pendingModeration: 0 // Mock value
    })
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChannelSelect = (channelUrl: string) => {
    setSelectedChannel(channelUrl)
    setIsChatOpen(true)
  }

  const handleCreateOrderChannel = async (orderId: string, customerId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/chat/sendbird/order-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`
        },
        body: JSON.stringify({
          orderId,
          customerId,
          supplierId: user.uid
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Add new channel to store
        // This would be handled by the store
        loadChannels() // Reload channels
      }
    } catch (error) {
      console.error('Failed to create order channel:', error)
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (notification.channelUrl) {
      setSelectedChannel(notification.channelUrl)
      setIsChatOpen(true)
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return messageTime.toLocaleDateString()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Authentication Required
          </h2>
          <p className="text-xl text-gray-600">Please log in to access the enterprise chat dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Simple Header with Homepage Button */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Logo size="md" />
                <span className="text-xl font-bold text-gray-900">NubiaGo</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
                <span className="text-lg font-semibold text-gray-900">Chat Dashboard</span>
              </div>
            </div>
            
            {/* Return to Homepage Button */}
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
              { id: 'channels', name: 'Channels', icon: ChatBubbleLeftRightIcon },
              { id: 'moderation', name: 'Moderation', icon: ShieldCheckIcon },
              { id: 'notifications', name: 'Notifications', icon: BellIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-6 px-4 border-b-2 font-semibold text-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 bg-primary-50 rounded-t-2xl'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-6 h-6 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Premium Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-gray-500">Total Channels</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalChannels}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
                    <BellIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-gray-500">Unread Messages</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-gray-500">Active Conversations</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeConversations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-2xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-gray-500">Pending Moderation</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingModeration}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Recent Channels */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Recent Conversations</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentChannels.length === 0 ? (
                  <div className="px-8 py-12 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No recent conversations</p>
                  </div>
                ) : (
                  recentChannels.map((channel) => (
                    <div
                      key={channel.channelUrl}
                      className="px-8 py-6 hover:bg-gray-50 cursor-pointer transition-all duration-300"
                      onClick={() => handleChannelSelect(channel.channelUrl)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{channel.name}</h4>
                          <p className="text-gray-600 truncate">{channel.lastMessage}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatTime(channel.lastMessageTime)}</p>
                            <p className="text-sm text-gray-500">{channel.participants} participants</p>
                          </div>
                          {channel.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
                              {channel.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">All Channels</h3>
                <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  Create Channel
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {rooms.length === 0 ? (
                <div className="px-8 py-12 text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No channels available</p>
                </div>
              ) : (
                rooms.map((channel) => (
                  <div
                    key={channel.id}
                    className="px-8 py-6 hover:bg-gray-50 cursor-pointer transition-all duration-300"
                    onClick={() => handleChannelSelect(channel.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{channel.name}</h4>
                        <p className="text-gray-600">
                          {(channel.participants?.length || 0)} participants
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {channel.updatedAt ? formatTime(channel.updatedAt.toString()) : 'No activity'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
            <AdminModeration theme="light" showFilters={true} maxQueueItems={20} />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="px-8 py-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="px-8 py-12 text-center text-gray-500">
                  <BellIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-8 py-6 hover:bg-gray-50 cursor-pointer transition-all duration-300"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h4>
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-2">{formatTime(notification.timestamp)}</p>
                        {!notification.isRead && (
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {selectedChannel && (
        <ChatWidget
          channelUrl={selectedChannel}
          isOpen={isChatOpen}
          onToggle={setIsChatOpen}
          position="bottom-right"
          theme="light"
          showNotifications={true}
        />
      )}

      {/* Message Notifications */}
      <MessageNotifications
        maxNotifications={5}
        autoHide={true}
        hideDelay={5000}
        position="top-right"
        theme="light"
      />
    </div>
  )
}

export default SupplierChatDashboard 
