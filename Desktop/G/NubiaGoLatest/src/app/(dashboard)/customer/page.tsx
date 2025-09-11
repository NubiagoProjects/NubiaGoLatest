'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Grid3X3, ShoppingBag, Heart, User, Bell, MessageSquare, Settings, 
  Package, DollarSign, Award, Calendar, Search, Filter, Eye, Truck, 
  ShoppingCart, MoreHorizontal, XCircle, Clock, CheckCircle, 
  AlertTriangle, Loader, CreditCard, MapPin, Star, TrendingUp,
  Activity, FileText, HelpCircle, Phone, ArrowUpRight
} from 'lucide-react'
import ModernDashboardLayout from '@/components/dashboard/ModernDashboardLayout'
import ModernDashboardCards, { ActivityCard, ProgressCard } from '@/components/dashboard/ModernDashboardCards'
import ResponsiveDashboardGrid, { ResponsiveStatsCard, ResponsiveActionCard } from '@/components/dashboard/ResponsiveDashboardGrid'
import ResponsiveDataView from '@/components/dashboard/ResponsiveDataView'

export default function CustomerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)


  // Mock data
  const [profile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  })

  const [stats] = useState({
    totalOrders: 24,
    totalSpent: 2847,
    loyaltyPoints: 1250,
    activeWishlist: 8,
    memberSince: '2023-01-15',
    averageRating: 4.8,
    pendingOrders: 3,
    completedOrders: 21
  })

  const [orders] = useState([
    {
      id: 'ORD-001',
      items: [{ name: 'Wireless Headphones' }, { name: 'Phone Case' }],
      total: 299.99,
      status: 'delivered',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'ORD-002',
      items: [{ name: 'Laptop Stand' }],
      total: 89.99,
      status: 'shipped',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: 'ORD-003',
      items: [{ name: 'USB Cable' }, { name: 'Power Bank' }],
      total: 45.99,
      status: 'processing',
      createdAt: '2024-01-13T09:15:00Z'
    }
  ])

  const [notifications] = useState([
    {
      id: 1,
      title: 'Order Shipped',
      message: 'Your order ORD-002 has been shipped and is on its way!',
      date: '2 hours ago',
      read: false
    },
    {
      id: 2,
      title: 'New Promotion',
      message: 'Get 20% off on electronics this weekend!',
      date: '1 day ago',
      read: true
    }
  ])

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  const handleThemeToggle = useCallback(() => {
    setDarkMode(prev => !prev)
  }, [])

  const handleLogout = useCallback(() => {
    router.push('/auth/login')
  }, [router])

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query)
  }, [])

  const handleOrderAction = useCallback((action: string, orderId: string) => {
    switch (action) {
      case 'view':
        router.push(`/customer/orders/${orderId}`)
        break
      case 'track':
        router.push(`/customer/orders/${orderId}/tracking`)
        break
      case 'reorder':
        // Find the order and add its items to cart
        const order = orders.find((o: any) => o.id === orderId)
        if (order) {
          // In a real app, you'd add items to cart via a service
          // In a real app, use a toast notification instead of alert
          router.push('/cart')
        }
        break
      default:
        console.log(`Unknown action: ${action}`)
    }
  }, [router, orders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Loader className="h-4 w-4" />
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'overview', icon: Grid3X3, label: 'Dashboard', path: '/customer' },
    { id: 'orders', icon: ShoppingBag, label: 'My Orders', path: '/customer/orders', badge: stats.pendingOrders },
    { id: 'wishlist', icon: Heart, label: 'Wishlist', path: '/customer/wishlist', badge: stats.activeWishlist },
    { id: 'profile', icon: User, label: 'Profile', path: '/customer/profile' },
    { id: 'payments', icon: CreditCard, label: 'Payment Methods', path: '/customer/payment-methods' },
    { id: 'addresses', icon: MapPin, label: 'Addresses', path: '/customer/addresses' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/customer/notifications' },
    { id: 'support', icon: HelpCircle, label: 'Help & Support', path: '/customer/support' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/customer/settings' }
  ]

  const dashboardCards = [
    {
      id: 'orders',
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'blue' as const,
      trend: { value: 12, label: 'vs last month', direction: 'up' as const },
      subtitle: `${stats.pendingOrders} pending`
    },
    {
      id: 'spent',
      title: 'Total Spent',
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'green' as const,
      trend: { value: 8, label: 'vs last month', direction: 'up' as const },
      subtitle: 'Lifetime spending'
    },
    {
      id: 'points',
      title: 'Loyalty Points',
      value: stats.loyaltyPoints.toString(),
      icon: Award,
      color: 'yellow' as const,
      trend: { value: 15, label: 'vs last month', direction: 'up' as const },
      subtitle: '150 points earned this month'
    },
    {
      id: 'wishlist',
      title: 'Wishlist Items',
      value: stats.activeWishlist.toString(),
      icon: Heart,
      color: 'red' as const,
      trend: { value: 25, label: 'vs last month', direction: 'up' as const },
      subtitle: 'Items saved for later'
    }
  ]

  const quickStats = [
    { label: 'Member Since', value: new Date(stats.memberSince).toLocaleDateString(), color: 'green' as const },
    { label: 'Average Rating', value: `${stats.averageRating}★`, color: 'blue' as const },
    { label: 'Pending Orders', value: stats.pendingOrders, color: 'yellow' as const },
    { label: 'Completed Orders', value: stats.completedOrders, color: 'gray' as const }
  ]

  const orderColumns = [
    { key: 'id', label: 'Order ID', mobileLabel: 'Order' },
    { 
      key: 'items', 
      label: 'Items', 
      render: (items: any[]) => items.map(item => item.name).join(', '),
      mobileLabel: 'Products'
    },
    { 
      key: 'total', 
      label: 'Total', 
      render: (total: number) => `$${total}`,
      mobileLabel: 'Amount'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </span>
      ),
      mobileLabel: 'Status'
    },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (date: string) => new Date(date).toLocaleDateString(),
      mobileLabel: 'Order Date'
    }
  ]

  const orderActions = [
    { key: 'view', label: 'View', icon: Eye, onClick: (order: any) => handleOrderAction('view', order.id) },
    { key: 'track', label: 'Track', icon: Truck, onClick: (order: any) => handleOrderAction('track', order.id) },
    { key: 'reorder', label: 'Reorder', icon: ShoppingCart, onClick: (order: any) => handleOrderAction('reorder', order.id) }
  ]

  const quickActions = (
    <div className="space-y-2">
      <button 
        onClick={() => setShowMessageModal(true)}
        className="w-full flex items-center space-x-2 p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors touch-manipulation"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Contact Support</span>
      </button>
      <button 
        onClick={() => setShowNotificationModal(true)}
        className="w-full flex items-center space-x-2 p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors touch-manipulation"
      >
        <Bell className="h-4 w-4" />
        <span>Notifications</span>
      </button>
      <button
        onClick={() => setShowCalendarModal(true)}
        className="w-full flex items-center space-x-2 p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors touch-manipulation"
      >
        <Calendar className="h-4 w-4" />
        <span>Order Calendar</span>
      </button>
    </div>
  )

  // Recent activities data
  const recentActivities = [
    {
      id: '1',
      title: 'Order Delivered',
      description: 'Wireless Headphones have been delivered',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      id: '2',
      title: 'Order Shipped',
      description: 'Laptop Stand is on its way',
      time: '1 day ago',
      icon: Truck,
      color: 'blue' as const
    },
    {
      id: '3',
      title: 'Points Earned',
      description: 'Earned 50 loyalty points',
      time: '2 days ago',
      icon: Award,
      color: 'yellow' as const
    },
    {
      id: '4',
      title: 'Wishlist Updated',
      description: 'Added Smart Watch to wishlist',
      time: '3 days ago',
      icon: Heart,
      color: 'red' as const
    }
  ]

  return (
    <ModernDashboardLayout
      title={`Welcome back, ${profile.firstName}!`}
      subtitle="Track your orders, manage your account, and discover amazing products."
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      theme="blue"
      user={{
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        role: 'Customer'
      }}
      onLogout={handleLogout}
      breadcrumbs={[
        { label: 'Dashboard' }
      ]}
    >
      <div className="space-y-8">
        {/* Dashboard Cards */}
        <ModernDashboardCards cards={dashboardCards} loading={loading} theme="blue" />

        {/* Main Content Grid - Mobile-First Responsive */}
        <ResponsiveDashboardGrid 
          cols={{ default: 1, lg: 3 }}
          gap="lg"
          className="mb-8"
        >
          {/* Recent Orders - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Orders</h3>
                <Link href="/customer/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center self-start sm:self-auto">
                  View All Orders
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{order.id}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.total}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Responsive spacing */}
          <div className="space-y-4 sm:space-y-6">
            {/* Progress Card */}
            <ProgressCard
              title="Loyalty Progress"
              value={stats.loyaltyPoints}
              max={2000}
              color="blue"
              icon={Award}
              subtitle="Next reward at 2,000 points"
            />

            {/* Recent Activity */}
            <ActivityCard
              title="Recent Activity"
              activities={recentActivities}
              viewAllLink="/customer/activity"
            />
          </div>
        </ResponsiveDashboardGrid>

        {/* Order History - Responsive Data View */}
        <ResponsiveDataView
          data={filteredOrders}
          columns={orderColumns}
          actions={orderActions}
          searchable
          filterable
          searchPlaceholder="Search orders..."
          onSearch={handleSearch}
          onFilter={setSelectedStatus}
          filterOptions={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' }
          ]}
          emptyMessage="No orders found"
          className="mb-6"
        />
      </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Support Messages</h3>
                <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Support Team</p>
                      <p className="text-sm text-gray-600 mt-1">Your order ORD-001 has been shipped and is on its way!</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">System</p>
                      <p className="text-sm text-gray-600 mt-1">Welcome to NubiaGo! Your account has been verified.</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => {
                    setShowMessageModal(false)
                    router.push('/customer/support')
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  View All Messages
                </button>
              </div>
            </div>
          </div>
        )}

        {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => {
                  setShowNotificationModal(false)
                  router.push('/customer/notifications')
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order Calendar</h3>
              <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Order calendar feature coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </ModernDashboardLayout>
  )
}
