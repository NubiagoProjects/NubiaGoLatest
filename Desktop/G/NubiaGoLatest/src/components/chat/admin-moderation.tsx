'use client'

import React, { useState, useEffect } from 'react'
import { useChatStore } from '@/store/chat'
// import { ChatMessage, ChatUser } from '@/lib/sendbird'
// Use fallback types for ChatMessage and ChatUser

interface ChatMessage {
  id: string
  type: 'text' | 'image' | 'file'
  message: string
  channelId: string
  userId: string
  timestamp: Date
  metadata?: Record<string, any>
}
// Define a minimal ChatUser type for fallback
interface ChatUser {
  id: string
  userId: string
  name: string
  nickname: string
  avatar?: string
  metadata?: {
    status?: string
  }
}
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  TrashIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

// ============================================================================
// ADMIN MODERATION TYPES
// ============================================================================

interface AdminModerationProps {
  theme?: 'light' | 'dark'
  showFilters?: boolean
  maxQueueItems?: number
}

interface ModerationQueueItemProps {
  message: ChatMessage
  onApprove: (messageId: string) => void
  onReject: (messageId: string) => void
  onBanUser: (userId: string) => void
  onMuteUser: (userId: string) => void
  theme?: 'light' | 'dark'
}

interface UserManagementProps {
  users: ChatUser[]
  onBanUser: (userId: string) => void
  onUnbanUser: (userId: string) => void
  onMuteUser: (userId: string) => void
  onUnmuteUser: (userId: string) => void
  theme?: 'light' | 'dark'
}

// ============================================================================
// MODERATION QUEUE ITEM COMPONENT
// ============================================================================

const ModerationQueueItem: React.FC<ModerationQueueItemProps> = ({
  message,
  onApprove,
  onReject,
  onBanUser,
  onMuteUser,
  theme = 'light'
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString()
  }

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'file':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />
    }
  }

  return (
    <div className={`border rounded-lg p-4 mb-3 ${
      theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-red-600' : 'bg-red-100'
          }`}>
            <ExclamationTriangleIcon className={`w-4 h-4 ${
              theme === 'dark' ? 'text-white' : 'text-red-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                             <span className={`font-medium text-sm ${
                 theme === 'dark' ? 'text-white' : 'text-gray-900'
               }`}>
                 {message.userId}
               </span>
              <span className={`text-xs px-2 py-1 rounded ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type}
              </span>
              {getMessageTypeIcon(message.type)}
            </div>
            
                         <div className={`text-sm ${
               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
             }`}>
               {message.message}
             </div>
            
                         <div className={`text-xs mt-2 ${
               theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
             }`}>
               {formatTime(message.timestamp)}
             </div>
            
            {isExpanded && (
              <div className={`mt-3 p-3 rounded ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-medium text-sm mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Message Details
                </h4>
                                 <div className="space-y-1 text-xs">
                   <div><strong>Message ID:</strong> {message.id}</div>
                   <div><strong>Channel:</strong> {message.channelId}</div>
                   <div><strong>User ID:</strong> {message.userId}</div>
                 </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title={isExpanded ? 'Hide details' : 'Show details'}
          >
            {isExpanded ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                 <button
           onClick={() => onApprove(message.id)}
           className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
         >
           Approve
         </button>
         <button
           onClick={() => onReject(message.id)}
           className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
         >
           Reject
         </button>
         <button
           onClick={() => onBanUser(message.userId)}
           className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
         >
           Ban User
         </button>
         <button
           onClick={() => onMuteUser(message.userId)}
           className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
         >
           Mute User
         </button>
      </div>
    </div>
  )
}

// ============================================================================
// USER MANAGEMENT COMPONENT
// ============================================================================

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onBanUser,
  onUnbanUser,
  onMuteUser,
  onUnmuteUser,
  theme = 'light'
}) => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || user.metadata?.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className={`border rounded-lg p-4 ${
      theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      <h3 className={`font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        User Management
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`flex-1 px-3 py-2 border rounded ${
            theme === 'dark' 
              ? 'border-gray-600 bg-gray-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-3 py-2 border rounded ${
            theme === 'dark' 
              ? 'border-gray-600 bg-gray-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="muted">Muted</option>
        </select>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user.userId}
            className={`flex items-center justify-between p-3 rounded ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.nickname}
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user.userId}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {user.metadata?.status === 'banned' ? (
                <button
                  onClick={() => onUnbanUser(user.userId)}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Unban
                </button>
              ) : (
                <button
                  onClick={() => onBanUser(user.userId)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Ban
                </button>
              )}
              
              {user.metadata?.status === 'muted' ? (
                <button
                  onClick={() => onUnmuteUser(user.userId)}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Unmute
                </button>
              ) : (
                <button
                  onClick={() => onMuteUser(user.userId)}
                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Mute
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ADMIN MODERATION COMPONENT
// ============================================================================

const AdminModeration: React.FC<AdminModerationProps> = ({
  theme = 'light',
  showFilters = true,
  maxQueueItems = 10
}) => {
  // Mock data since these properties don't exist in the store
  const moderationQueue: ChatMessage[] = []
  const isAdmin = true
  
  const removeFromModerationQueue = (messageId: string) => {
    // Mock function
    console.log('Remove from moderation queue:', messageId)
  }
  
  const clearModerationQueue = () => {
    // Mock function
    console.log('Clear moderation queue')
  }

  const [activeTab, setActiveTab] = useState<'queue' | 'users'>('queue')
  const [filter, setFilter] = useState('all')
  const [users, setUsers] = useState<ChatUser[]>([])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load users for management
    loadUsers()
  }, [])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/chat/sendbird/users')
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleApproveMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/sendbird/messages/${messageId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        removeFromModerationQueue(messageId)
      }
    } catch (error) {
      console.error('Failed to approve message:', error)
    }
  }

  const handleRejectMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/sendbird/messages/${messageId}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        removeFromModerationQueue(messageId)
      }
    } catch (error) {
      console.error('Failed to reject message:', error)
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/sendbird/users/${userId}/ban`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Update user status in local state
        setUsers(prev => prev.map(user => 
          user.userId === userId 
            ? { ...user, metadata: { ...user.metadata, status: 'banned' } }
            : user
        ))
      }
    } catch (error) {
      console.error('Failed to ban user:', error)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/sendbird/users/${userId}/unban`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.userId === userId 
            ? { ...user, metadata: { ...user.metadata, status: 'active' } }
            : user
        ))
      }
    } catch (error) {
      console.error('Failed to unban user:', error)
    }
  }

  const handleMuteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/sendbird/users/${userId}/mute`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.userId === userId 
            ? { ...user, metadata: { ...user.metadata, status: 'muted' } }
            : user
        ))
      }
    } catch (error) {
      console.error('Failed to mute user:', error)
    }
  }

  const handleUnmuteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/sendbird/users/${userId}/unmute`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.userId === userId 
            ? { ...user, metadata: { ...user.metadata, status: 'active' } }
            : user
        ))
      }
    } catch (error) {
      console.error('Failed to unmute user:', error)
    }
  }

  const handleClearQueue = () => {
    clearModerationQueue()
  }

  // ============================================================================
  // FILTER QUEUE
  // ============================================================================

  const filteredQueue = moderationQueue.filter(message => {
    if (filter === 'all') return true
    if (filter === 'text' && message.type === 'text') return true
    if (filter === 'image' && message.type === 'image') return true
    if (filter === 'file' && message.type === 'file') return true
    return false
  }).slice(0, maxQueueItems)

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isAdmin) {
    return (
      <div className={`text-center py-8 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Admin access required</p>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg ${
      theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6" />
          <h2 className={`font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Chat Moderation
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {moderationQueue.length} items in queue
          </span>
          <button
            onClick={handleClearQueue}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'queue'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Moderation Queue ({moderationQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          User Management ({users.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'queue' ? (
          <div>
            {showFilters && (
              <div className="mb-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`px-3 py-2 border rounded ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Messages</option>
                  <option value="text">Text Messages</option>
                  <option value="image">Images</option>
                  <option value="file">Files</option>
                </select>
              </div>
            )}

            {filteredQueue.length === 0 ? (
              <div className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages in moderation queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                                 {filteredQueue.map((message) => (
                   <ModerationQueueItem
                     key={message.id}
                     message={message}
                     onApprove={handleApproveMessage}
                     onReject={handleRejectMessage}
                     onBanUser={handleBanUser}
                     onMuteUser={handleMuteUser}
                     theme={theme}
                   />
                 ))}
              </div>
            )}
          </div>
        ) : (
          <UserManagement
            users={users}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
            onMuteUser={handleMuteUser}
            onUnmuteUser={handleUnmuteUser}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}

export default AdminModeration 
