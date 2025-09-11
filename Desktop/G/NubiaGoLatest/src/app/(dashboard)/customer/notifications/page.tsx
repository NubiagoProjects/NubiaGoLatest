'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, CheckCircle, Package, Truck, CreditCard,
  XCircle, Clock, Eye, Trash2, Settings, Check, Filter
} from 'lucide-react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface Notification {
  id: string
  type: 'order' | 'payment' | 'message' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any
}

export default function CustomerNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'order',
          title: 'Order Shipped',
          message: 'Your order #ORD-001 has been shipped and is on its way to you.',
          isRead: false,
          createdAt: '2024-01-22T10:30:00Z',
          data: { orderId: 'ORD-001' }
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Successful',
          message: 'Your payment of $99.99 has been processed successfully.',
          isRead: true,
          createdAt: '2024-01-21T15:45:00Z',
          data: { amount: 99.99 }
        },
        {
          id: '3',
          type: 'system',
          title: 'Welcome to NubiaGo!',
          message: 'Thank you for joining our platform. We\'re excited to have you on board.',
          isRead: true,
          createdAt: '2024-01-20T09:00:00Z'
        },
        {
          id: '4',
          type: 'message',
          title: 'New Message from Support',
          message: 'We\'ve responded to your support ticket. Click to view the message.',
          isRead: false,
          createdAt: '2024-01-19T14:20:00Z',
          data: { ticketId: 'TICKET-001' }
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-5 w-5" />
      case 'payment': return <CreditCard className="h-5 w-5" />
      case 'message': return <Bell className="h-5 w-5" />
      case 'system': return <Settings className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-100'
      case 'payment': return 'text-green-600 bg-green-100'
      case 'message': return 'text-purple-600 bg-purple-100'
      case 'system': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    return notification.type === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/customer' },
    { label: 'Notifications', href: '/customer/notifications' }
  ]

  const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'order', label: 'Order Updates' },
    { value: 'payment', label: 'Payment Alerts' },
    { value: 'message', label: 'Messages' },
    { value: 'system', label: 'System Alerts' }
  ]

  return (
    <ModernSubpageLayout
      title="Notifications"
      description="Stay updated with your orders and account activity"
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: 'Mark All Read',
          onClick: markAllAsRead,
          variant: 'secondary',
          icon: Check
        }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => !n.isRead).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'order').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Payments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'payment').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        filters={[
          {
            key: 'type',
            label: 'Type',
            value: filter,
            options: filterOptions,
            onChange: (value) => setFilter(value)
          }
        ]}
        onClearFilters={() => setFilter('all')}
        showDateRange={false}
      />

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'You\'re all caught up!'
                : 'No notifications match your filter.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <StatusBadge status="new" type="notification" />
                          )}
                          <StatusBadge status={notification.type} type="notification" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModernSubpageLayout>
  )
} 
