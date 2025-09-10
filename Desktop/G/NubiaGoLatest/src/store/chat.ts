import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderType: 'customer' | 'supplier' | 'admin'
  content: string
  messageType: 'text' | 'image' | 'file' | 'system'
  timestamp: Date
  isRead: boolean
  attachments?: {
    url: string
    name: string
    type: string
    size: number
  }[]
}

export interface ChatRoom {
  id: string
  name: string
  type: 'customer_support' | 'order_inquiry' | 'general'
  participants: {
    id: string
    name: string
    type: 'customer' | 'supplier' | 'admin'
    isOnline: boolean
  }[]
  lastMessage?: ChatMessage
  unreadCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ChatNotification {
  id: string
  type: 'message' | 'mention' | 'system'
  title: string
  message: string
  roomId: string
  isRead: boolean
  createdAt: Date
  timestamp: string // Add this property for compatibility
}

interface ChatState {
  rooms: ChatRoom[]
  currentRoom: ChatRoom | null
  messages: ChatMessage[]
  notifications: ChatNotification[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

interface ChatActions {
  // Room management
  addRoom: (room: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateRoom: (id: string, updates: Partial<ChatRoom>) => void
  removeRoom: (id: string) => void
  selectRoom: (room: ChatRoom | null) => void
  markRoomAsRead: (roomId: string) => void
  markAsRead: (roomId: string) => void
  
  // Message management
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setMessages: (messages: ChatMessage[]) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  removeMessage: (id: string) => void
  markMessageAsRead: (messageId: string) => void
  
  // Notifications
  addNotification: (notification: Omit<ChatNotification, 'id' | 'createdAt'>) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
  
  // Connection
  setConnectionStatus: (isConnected: boolean) => void
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      // Initial state
      rooms: [],
      currentRoom: null,
      messages: [],
      notifications: [],
      isConnected: false,
      isLoading: false,
      error: null,

      // Room management
      addRoom: (room) => {
        const newRoom: ChatRoom = {
          ...room,
          id: `room-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          rooms: [...state.rooms, newRoom]
        }))
      },

      updateRoom: (id, updates) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === id 
              ? { ...room, ...updates, updatedAt: new Date() }
              : room
          ),
          currentRoom: state.currentRoom?.id === id
            ? { ...state.currentRoom, ...updates, updatedAt: new Date() }
            : state.currentRoom
        }))
      },

      removeRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter(room => room.id !== id),
          currentRoom: state.currentRoom?.id === id ? null : state.currentRoom
        }))
      },

      selectRoom: (room) => {
        set({ currentRoom: room })
      },

      markRoomAsRead: (roomId) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === roomId ? { ...room, unreadCount: 0 } : room
          ),
          currentRoom: state.currentRoom?.id === roomId
            ? { ...state.currentRoom, unreadCount: 0 }
            : state.currentRoom
        }))
      },

      markAsRead: (roomId) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === roomId ? { ...room, unreadCount: 0 } : room
          ),
          currentRoom: state.currentRoom?.id === roomId
            ? { ...state.currentRoom, unreadCount: 0 }
            : state.currentRoom
        }))
      },

      // Message management
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date()
        }
        set((state) => ({
          messages: [...state.messages, newMessage]
        }))
      },

      setMessages: (messages) => {
        set({ messages })
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map(message =>
            message.id === id ? { ...message, ...updates } : message
          )
        }))
      },

      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter(message => message.id !== id)
        }))
      },

      markMessageAsRead: (messageId) => {
        set((state) => ({
          messages: state.messages.map(message =>
            message.id === messageId ? { ...message, isRead: true } : message
          )
        }))
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: ChatNotification = {
          ...notification,
          id: `notif-${Date.now()}`,
          createdAt: new Date()
        }
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      // Connection
      setConnectionStatus: (isConnected) => {
        set({ isConnected })
      },

      // State management
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      reset: () => {
        set({
          rooms: [],
          currentRoom: null,
          messages: [],
          notifications: [],
          isConnected: false,
          isLoading: false,
          error: null
        })
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        rooms: state.rooms,
        currentRoom: state.currentRoom,
        messages: state.messages,
        notifications: state.notifications
      })
    }
  )
) 
