'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Shield, BarChart3, Settings, LogOut, Search, 
  Edit, CheckCircle, XCircle, Clock, TrendingUp, DollarSign,
  Package, ShoppingBag, ArrowRight, Filter, Plus, Sun, Moon,
  Grid3X3, Calendar, Mail, List, User, Bell, ChevronDown,
  Wallet, CreditCard, Activity, TrendingDown, ArrowUpRight,
  MoreHorizontal, Flag, Star, ShoppingCart, Store, Globe,
  Download, FileText, Zap, Eye, AlertTriangle, Database,
  Server, Cpu, HardDrive, Network, Lock, UserCheck
} from 'lucide-react'
import Link from 'next/link'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import ModernDashboardLayout from '@/components/dashboard/ModernDashboardLayout'
import ModernDashboardCards, { ActivityCard, ProgressCard } from '@/components/dashboard/ModernDashboardCards'
import ResponsiveDashboardGrid, { ResponsiveStatsCard, ResponsiveActionCard } from '@/components/dashboard/ResponsiveDashboardGrid'
import ResponsiveDataView from '@/components/dashboard/ResponsiveDataView'

export default function AdminDashboard() {
  const router = useRouter()
  const { user: adminUser } = useAuth()
  const { success, error } = useToast()
  const {
    // Store state
    users,
    suppliers,
    orders,
    userStats,
    productStats,
    orderStats,
    supplierStats,
    activeTab,
    darkMode,
    searchQuery,
    selectedOrders,
    loading,
    
    // Store actions
    fetchUsers,
    fetchSuppliers,
    fetchOrders,
    setActiveTab,
    setSearchQuery,
    setSelectedOrders,
    updateSupplierApproval,
    updateOrderStatus,
    toggleDarkMode
  } = useAdminDashboardStore()

  // Local state for modals
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Mock data for messages and notifications
  const messages = [
    { id: '1', title: 'New Supplier Application', content: 'TechCorp Ltd has submitted their application', type: 'info', date: '2 hours ago', read: false },
    { id: '2', title: 'Order Issue Reported', content: 'Order #12345 has a delivery problem', type: 'warning', date: '4 hours ago', read: true },
    { id: '3', title: 'System Update Complete', content: 'Database maintenance completed successfully', type: 'success', date: '1 day ago', read: true }
  ]

  const notifications = [
    { id: '1', title: 'New Order', message: 'Order #12346 received from John Doe', type: 'order', date: '1 hour ago', read: false },
    { id: '2', title: 'Supplier Approved', message: 'GreenTech Solutions has been approved', type: 'supplier', date: '3 hours ago', read: true },
    { id: '3', title: 'System Alert', message: 'High server load detected', type: 'system', date: '6 hours ago', read: false }
  ]

  useEffect(() => {
    fetchUsers()
    fetchSuppliers()
    fetchOrders()
  }, [fetchUsers, fetchSuppliers, fetchOrders])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [setActiveTab])

  const handleLogout = useCallback(() => {
    router.push('/auth/login')
  }, [router])

  const handleThemeToggle = useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100'
      case 'supplier': return 'text-blue-600 bg-blue-100'
      case 'customer': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
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
    { id: 'overview', icon: Grid3X3, label: 'Dashboard', path: '/admin' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/users', badge: userStats.totalUsers },
    { id: 'suppliers', icon: Shield, label: 'Suppliers', path: '/admin/suppliers', badge: supplierStats.totalSuppliers },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { id: 'products', icon: Package, label: 'Products', path: '/admin/products' },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals', path: '/admin/approvals', badge: 5 },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { id: 'monitoring', icon: Server, label: 'System Health', path: '/admin/monitoring' },
    { id: 'apis', icon: Zap, label: 'API Management', path: '/admin/apis' },
    { id: 'security', icon: Lock, label: 'Security', path: '/admin/security' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' }
  ]

  const dashboardCards = [
    {
      id: 'users',
      title: 'Total Users',
      value: (userStats.totalUsers || 0).toString(),
      icon: Users,
      color: 'purple' as const,
      trend: { value: 12, label: 'vs last month', direction: 'up' as const },
      subtitle: '245 active this week'
    },
    {
      id: 'suppliers',
      title: 'Active Suppliers',
      value: (supplierStats.totalSuppliers || 0).toString(),
      icon: Shield,
      color: 'green' as const,
      trend: { value: 8, label: 'vs last month', direction: 'up' as const },
      subtitle: '5 pending approval'
    },
    {
      id: 'orders',
      title: 'Platform Orders',
      value: (orderStats.totalOrders || 0).toString(),
      icon: ShoppingCart,
      color: 'blue' as const,
      trend: { value: 15, label: 'vs last month', direction: 'up' as const },
      subtitle: '89% completion rate'
    },
    {
      id: 'revenue',
      title: 'Platform Revenue',
      value: `$${(orderStats.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow' as const,
      trend: { value: 22, label: 'vs last month', direction: 'up' as const },
      subtitle: '15% commission earned'
    }
  ]

  const quickStats = [
    { label: 'Pending Approvals', value: supplierStats.totalSuppliers || 0, color: 'yellow' as const },
    { label: 'System Alerts', value: 3, color: 'red' as const },
    { label: 'Active Sessions', value: userStats.totalUsers || 0, color: 'blue' as const },
    { label: 'API Calls Today', value: '12.5K', color: 'green' as const }
  ]

  const userColumns = [
    { key: 'name', label: 'Name', mobileLabel: 'User' },
    { key: 'email', label: 'Email', mobileLabel: 'Contact' },
    { 
      key: 'role', 
      label: 'Role',
      render: (role: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(role)}`}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      ),
      mobileLabel: 'Role'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
      mobileLabel: 'Status'
    },
    { 
      key: 'createdAt', 
      label: 'Joined',
      render: (date: string) => new Date(date).toLocaleDateString(),
      mobileLabel: 'Join Date'
    }
  ]

  const userActions = [
    { key: 'view', label: 'View', icon: Eye, onClick: (user: any) => router.push(`/admin/users/${user.id}`) },
    { key: 'edit', label: 'Edit', icon: Edit, onClick: (user: any) => router.push(`/admin/users/${user.id}/edit`) },
    { key: 'suspend', label: 'Suspend', icon: XCircle, onClick: (user: any) => {
      if (confirm(`Are you sure you want to suspend user ${user.name}?`)) {
        success(`User ${user.name} has been suspended`)
        // In real app, call API to suspend user
      }
    }}
  ]

  const quickActions = (
    <div className="space-y-2">
      <button
        onClick={() => setShowMessageModal(true)}
        className="w-full flex items-center space-x-2 p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors touch-manipulation"
      >
        <Mail className="h-4 w-4" />
        <span>View Messages</span>
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
        <span>Calendar</span>
      </button>
      <button
        onClick={() => setShowSettingsModal(true)}
        className="w-full flex items-center space-x-2 p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors touch-manipulation"
      >
        <Settings className="h-4 w-4" />
        <span>Settings</span>
      </button>
    </div>
  )

  // Recent activities data
  const recentActivities = [
    {
      id: '1',
      title: 'New Supplier Registered',
      description: 'TechCorp Ltd submitted application',
      time: '10 minutes ago',
      icon: Shield,
      color: 'purple' as const
    },
    {
      id: '2',
      title: 'System Alert',
      description: 'High server load detected',
      time: '30 minutes ago',
      icon: AlertTriangle,
      color: 'red' as const
    },
    {
      id: '3',
      title: 'Order Dispute',
      description: 'Order #12345 requires review',
      time: '1 hour ago',
      icon: Flag,
      color: 'yellow' as const
    },
    {
      id: '4',
      title: 'User Verification',
      description: '15 users verified today',
      time: '2 hours ago',
      icon: UserCheck,
      color: 'green' as const
    }
  ]

  return (
    <AdminAuthGuard>
      <ModernDashboardLayout
        title="Admin Dashboard"
        subtitle="Monitor platform performance, manage users, and oversee marketplace operations."
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme="purple"
        user={{
          name: adminUser?.name || 'Admin',
          email: adminUser?.email || 'admin@nubiago.com',
          role: 'Administrator'
        }}
        onLogout={handleLogout}
        breadcrumbs={[
          { label: 'Dashboard' }
        ]}
      >
        <div className="space-y-8">
          {/* Dashboard Cards */}
          <ModernDashboardCards cards={dashboardCards} loading={loading} theme="purple" />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                  <Link href="/admin/monitoring" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
                    View Details
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                
                {/* System Health Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Server className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Server Status</p>
                    <p className="text-lg font-bold text-green-600">Online</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className="text-lg font-bold text-blue-600">Healthy</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Cpu className="h-4 w-4 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">CPU Usage</p>
                    <p className="text-lg font-bold text-yellow-600">67%</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <HardDrive className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Storage</p>
                    <p className="text-lg font-bold text-purple-600">45%</p>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Recent User Activity</h4>
                  {users.slice(0, 3).map((user, index) => (
                    <div key={user.uid || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        <div className="flex items-center space-x-2 mt-2">
                          <button className="text-purple-600 hover:text-purple-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            <XCircle className="h-4 w-4" />
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
              {/* Platform Health */}
              <ProgressCard
                title="Platform Health"
                value={92}
                max={100}
                color="purple"
                icon={Activity}
                subtitle="All systems operational"
              />

              {/* Recent Activity */}
              <ActivityCard
                title="Recent Activity"
                activities={recentActivities}
                viewAllLink="/admin/activity"
              />
            </div>
          </div>

          {/* Management Overview - Responsive Grid */}
          <ResponsiveDashboardGrid 
            cols={{ default: 1, sm: 2, lg: 3 }}
            gap="md"
          >
            <ResponsiveActionCard
              title="User Management"
              description={`${userStats.totalUsers || 0} total registered users`}
              icon={<Users />}
              onClick={() => router.push('/admin/users')}
              color="blue"
            />
            <ResponsiveActionCard
              title="Supplier Management"
              description={`${supplierStats.totalSuppliers || 0} verified suppliers`}
              icon={<Shield />}
              onClick={() => router.push('/admin/suppliers')}
              color="green"
            />
            <ResponsiveActionCard
              title="Order Management"
              description={`${orderStats.totalOrders || 0} total platform orders`}
              icon={<ShoppingCart />}
              onClick={() => router.push('/admin/orders')}
              color="yellow"
            />
          </ResponsiveDashboardGrid>
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
                  <div key={message.id} className={`p-3 rounded-lg border ${!message.read ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{message.title}</h4>
                      {!message.read && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
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
                <h3 className="text-lg font-semibold">Admin Calendar</h3>
                <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Calendar feature coming soon!</p>
              </div>
            </div>
          </div>
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Admin Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Settings panel coming soon!</p>
              </div>
            </div>
          </div>
        )}
      </ModernDashboardLayout>
    </AdminAuthGuard>
  )
} 
