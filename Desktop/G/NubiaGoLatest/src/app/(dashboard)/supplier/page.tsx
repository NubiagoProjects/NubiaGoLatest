'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, ShoppingBag, TrendingUp, DollarSign, Users, 
  Plus, Edit, Eye, Filter, Search, LogOut, Settings, User,
  CheckCircle, Clock, XCircle, ArrowRight, BarChart3, Truck,
  Sun, Moon, Grid3X3, Calendar, Mail, Bell, ChevronDown,
  Wallet, CreditCard, Activity, TrendingDown, ArrowUpRight,
  MoreHorizontal, Star, ShoppingCart, Store, Globe,
  Download, FileText, MessageSquare, Award, Target, Zap, Shield,
  MapPin, Percent, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import ModernDashboardLayout from '@/components/dashboard/ModernDashboardLayout'
import ModernDashboardCards, { ActivityCard, ProgressCard } from '@/components/dashboard/ModernDashboardCards'
import ResponsiveDashboardGrid, { ResponsiveStatsCard, ResponsiveActionCard } from '@/components/dashboard/ResponsiveDashboardGrid'
import ResponsiveDataView from '@/components/dashboard/ResponsiveDataView'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import { useToast } from '@/components/ui/toast'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  category: string
  sales: number
  rating: number
  image: string
}

interface Order {
  id: string
  customerName: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  createdAt: string
  items: number
}

interface Message {
  id: string
  title: string
  content: string
  type: 'order' | 'system' | 'customer'
  date: string
  read: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'product' | 'system' | 'customer'
  date: string
  read: boolean
}

interface SupplierStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageRating: number
  monthlyGrowth: number
  pendingOrders: number
  lowStockItems: number
  activeCustomers: number
  totalSales: number
  profitMargin: number
}

export default function SupplierDashboard() {
  const router = useRouter()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<SupplierStats>({
    totalRevenue: 2999.85,
    totalOrders: 15,
    totalProducts: 8,
    averageRating: 4.5,
    monthlyGrowth: 12.5,
    pendingOrders: 3,
    lowStockItems: 2,
    activeCustomers: 45,
    totalSales: 125,
    profitMargin: 23.5
  })
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Handle search toggle
  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle order selection
  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  // Handle select all orders
  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  // Handle export data
  const handleExportData = () => {
    // Create CSV data
    const csvData = orders.map(order => ({
      id: order.id,
      customer: order.customerName,
      total: order.total,
      status: order.status,
      date: order.createdAt
    }))
    
    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'supplier-data.csv'
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Data exported successfully!')
  }

  // Handle view reports
  const handleViewReports = () => {
    // Navigate to reports page
    router.push('/supplier/reports')
  }

          // Handle add product
        const handleAddProduct = () => {
    // Navigate to product creation
    router.push('/products/supplier/create')
        }

  // Handle theme toggle
  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
    // Apply theme to document
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/auth/login')
    }
  }

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset search when changing tabs
    setSearchQuery('')
  }

  // Handle more options menu
  const handleMoreOptions = (orderId: string) => {
    setShowMoreOptions(showMoreOptions === orderId ? null : orderId)
  }

  // Handle order actions
  const handleOrderAction = (action: string, orderId: string) => {
    setShowMoreOptions(null)
    switch (action) {
      case 'view':
        router.push(`/supplier/orders/${orderId}`)
        break
      case 'edit':
        router.push(`/supplier/orders/${orderId}/edit`)
        break
      case 'process':
        // Process order logic
        success('Order processing started!')
        break
      default:
        break
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          price: 299.99,
          stock: 25,
          status: 'active',
          category: 'Electronics',
          sales: 45,
          rating: 4.8,
          image: '/headphones.jpg'
        },
        {
          id: '2',
          name: 'Smart Fitness Watch',
          price: 199.99,
          stock: 15,
          status: 'active',
          category: 'Electronics',
          sales: 32,
          rating: 4.6,
          image: '/watch.jpg'
        },
        {
          id: '3',
          name: 'Laptop Stand',
          price: 49.99,
          stock: 8,
          status: 'active',
          category: 'Accessories',
          sales: 28,
          rating: 4.4,
          image: '/laptop-stand.jpg'
        }
      ])
      setOrders([
        {
          id: 'ORD-001',
          customerName: 'John Doe',
          status: 'pending',
          total: 299.99,
          createdAt: '2024-01-20',
          items: 1
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Smith',
          status: 'processing',
          total: 199.99,
          createdAt: '2024-01-19',
          items: 1
        },
        {
          id: 'ORD-003',
          customerName: 'Bob Wilson',
          status: 'shipped',
          total: 49.99,
          createdAt: '2024-01-18',
          items: 1
        }
      ])
      setMessages([
        { id: '1', title: 'New Order Received', content: 'Order ORD-001 has been placed by John Doe.', type: 'order', date: '2024-01-20', read: false },
        { id: '2', title: 'System Update', content: 'Your dashboard has been updated with new features.', type: 'system', date: '2024-01-19', read: true }
      ])
      setNotifications([
        { id: '1', title: 'Low Stock Alert', message: 'Laptop Stand is running low on stock.', type: 'product', date: '2024-01-20', read: false },
        { id: '2', title: 'New Customer', message: 'Bob Wilson has made their first purchase.', type: 'customer', date: '2024-01-18', read: true }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'shipped': return 'text-blue-600 bg-blue-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
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
    { id: 'overview', icon: Grid3X3, label: 'Dashboard', path: '/supplier' },
    { id: 'products', icon: Package, label: 'Products', path: '/products/supplier', badge: stats.lowStockItems },
    { id: 'orders', icon: ShoppingBag, label: 'Orders', path: '/supplier/orders', badge: stats.pendingOrders },
    { id: 'inventory', icon: BarChart3, label: 'Inventory', path: '/supplier/inventory' },
    { id: 'shipping', icon: Truck, label: 'Shipping', path: '/supplier/shipping' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', path: '/supplier/analytics' },
    { id: 'customers', icon: Users, label: 'Customers', path: '/supplier/customers' },
    { id: 'payments', icon: CreditCard, label: 'Payments', path: '/supplier/payments' },
    { id: 'support', icon: MessageSquare, label: 'Support', path: '/supplier/support' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/supplier/settings' }
  ]

  // Dashboard cards data
  const dashboardCards = [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: {
        value: stats.monthlyGrowth,
        label: 'vs last month',
        direction: 'up' as const
      },
      color: 'orange' as const,
      subtitle: `${stats.profitMargin}% profit margin`
    },
    {
      id: 'orders',
      title: 'Active Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      trend: {
        value: 8,
        label: 'vs last month',
        direction: 'up' as const
      },
      color: 'blue' as const,
      subtitle: `${stats.pendingOrders} pending`
    },
    {
      id: 'products',
      title: 'Products Listed',
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: {
        value: 12,
        label: 'vs last month',
        direction: 'up' as const
      },
      color: 'green' as const,
      subtitle: `${stats.lowStockItems} low stock`
    },
    {
      id: 'rating',
      title: 'Supplier Rating',
      value: `${stats.averageRating}★`,
      icon: Star,
      trend: {
        value: 5,
        label: 'vs last month',
        direction: 'up' as const
      },
      color: 'yellow' as const,
      subtitle: `${stats.activeCustomers} customers`
    }
  ]

  // Quick stats data
  const quickStats = [
    {
      label: 'Active Customers',
      value: stats.activeCustomers.toString(),
      icon: Users,
      color: 'blue' as const
    },
    {
      label: 'Total Sales',
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
      color: 'green' as const
    },
    {
      label: 'Profit Margin',
      value: `${stats.profitMargin}%`,
      icon: TrendingUp,
      color: 'yellow' as const
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      icon: Package,
      color: 'red' as const
    }
  ]

  // Orders table columns
  const orderColumns = [
    { key: 'id', label: 'Order ID', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'items', label: 'Items', sortable: false },
    { key: 'total', label: 'Total', sortable: true, render: (value: number) => `$${value}` },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          <span className="ml-1">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Date', 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ]

  // Quick actions
  const quickActions = [
    {
      key: 'messages',
      label: 'View Messages',
      icon: MessageSquare,
      onClick: () => setShowMessageModal(true)
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onClick: () => setShowNotificationModal(true)
    },
    {
      key: 'calendar',
      label: 'Order Calendar',
      icon: Calendar,
      onClick: () => setShowCalendarModal(true)
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => setShowSettingsModal(true)
    }
  ]

  // Recent activities data
  const recentActivities = [
    {
      id: '1',
      title: 'New Order Received',
      description: 'Order ORD-001 from John Doe',
      time: '5 minutes ago',
      icon: ShoppingBag,
      color: 'orange' as const
    },
    {
      id: '2',
      title: 'Product Updated',
      description: 'Wireless Headphones stock updated',
      time: '1 hour ago',
      icon: Package,
      color: 'blue' as const
    },
    {
      id: '3',
      title: 'Payment Received',
      description: 'Payment of $299.99 processed',
      time: '2 hours ago',
      icon: DollarSign,
      color: 'green' as const
    },
    {
      id: '4',
      title: 'Low Stock Alert',
      description: 'Laptop Stand running low',
      time: '4 hours ago',
      icon: AlertCircle,
      color: 'red' as const
    }
  ]


  return (
    <AdminAuthGuard>
      <ModernDashboardLayout
      title="Supplier Dashboard"
      subtitle="Manage your inventory, process orders, and track your business performance."
      sidebarItems={sidebarItems}
      breadcrumbs={[{ label: 'Dashboard', href: '/supplier' }]}
    >
      <div className="space-y-8">
        {/* Dashboard Cards */}
        <ModernDashboardCards cards={dashboardCards} loading={loading} theme="orange" />

        {/* Main Content Grid - Mobile-First Responsive */}
        <ResponsiveDashboardGrid 
          cols={{ default: 1, lg: 3 }}
          gap="lg"
          className="mb-8"
        >
          {/* Order Processing */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Processing</h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleAddProduct}
                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </button>
                  <Link href="/supplier/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center justify-center min-h-[44px] touch-manipulation">
                    View All Orders
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              {/* Order Pipeline */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Pending</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Processing</p>
                  <p className="text-lg font-bold text-blue-600">5</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Shipping</p>
                  <p className="text-lg font-bold text-orange-600">7</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Delivered</p>
                  <p className="text-lg font-bold text-green-600">12</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {order.items} items • ${order.total}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                      <div className="flex items-center space-x-2 mt-2">
                        <button className="text-orange-600 hover:text-orange-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-orange-600 hover:text-orange-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-orange-600 hover:text-orange-900">
                          <Truck className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inventory Progress */}
            <ProgressCard
              title="Inventory Health"
              value={stats.totalProducts - stats.lowStockItems}
              max={stats.totalProducts}
              color="orange"
              icon={Package}
              subtitle={`${stats.lowStockItems} items need restocking`}
            />

            {/* Recent Activity */}
            <ActivityCard
              title="Recent Activity"
              activities={recentActivities}
              viewAllLink="/supplier/activity"
            />
          </div>
        </ResponsiveDashboardGrid>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Active Customers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
            <p className="text-xs text-gray-500 mt-1">this month</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Healthy
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Profit Margin</p>
            <p className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</p>
            <p className="text-xs text-gray-500 mt-1">average margin</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                Excellent
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Customer Rating</p>
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating}★</p>
            <p className="text-xs text-gray-500 mt-1">average rating</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Messages</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`p-3 rounded-lg border ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{message.title}</h4>
                    {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{message.date}</p>
                </div>
              ))}
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
                <div key={notification.id} className={`p-3 rounded-lg border ${!notification.read ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    {!notification.read && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.date}</p>
                </div>
              ))}
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

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dark Mode</span>
                <button 
                  onClick={handleThemeToggle}
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <button className="w-12 h-6 rounded-full bg-primary-600">
                  <div className="w-4 h-4 bg-white rounded-full transform translate-x-6"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-refresh</span>
                <button className="w-12 h-6 rounded-full bg-gray-300">
                  <div className="w-4 h-4 bg-white rounded-full transform translate-x-1"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModernDashboardLayout>
    </AdminAuthGuard>
  )
} 
