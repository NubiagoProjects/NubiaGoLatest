'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Edit, Trash2, Search, Filter, Plus, 
  Download, FileText, Calendar, Clock, DollarSign,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Package, Truck, CheckCircle, XCircle, Activity,
  MoreVertical, RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DataTable from '@/components/dashboard/DataTable'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useAuth } from '@/hooks/useAuth'

export default function AdminOrders() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: toastError, warning } = useToast()
  const { 
    orders, 
    orderStats, 
    orderLoading: loading, 
    orderError: error,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    bulkUpdateOrders
  } = useAdminDashboardStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [searchValue, setSearchValue] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    dateRange: 'all',
    paymentMethod: 'all'
  })

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrders()
    }
  }, [user?.role, fetchOrders])

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setOrderFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Handle add order
  const handleAddOrder = () => {
    router.push('/admin/orders/new')
  }

  // Handle export
  const handleExport = () => {
    success('Export started', 'Order data export will be ready shortly')
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders()
    success('Data refreshed', 'Order data has been updated')
  }

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) {
      warning('No orders selected', 'Please select orders to perform bulk actions')
      return
    }

    try {
      switch (action) {
        case 'process':
          await bulkUpdateOrders(selectedOrders, { status: 'processing' }, 'admin-1', 'Bulk processing')
          success('Orders processed', `${selectedOrders.length} orders have been marked as processing`)
          break
        case 'ship':
          await bulkUpdateOrders(selectedOrders, { status: 'shipped' }, 'admin-1', 'Bulk shipping')
          success('Orders shipped', `${selectedOrders.length} orders have been marked as shipped`)
          break
        case 'deliver':
          await bulkUpdateOrders(selectedOrders, { status: 'delivered' }, 'admin-1', 'Bulk delivery')
          success('Orders delivered', `${selectedOrders.length} orders have been marked as delivered`)
          break
        case 'cancel':
          if (confirm(`Are you sure you want to cancel ${selectedOrders.length} orders? This action cannot be undone.`)) {
            await bulkUpdateOrders(selectedOrders, { status: 'cancelled' }, 'admin-1', 'Bulk cancellation')
            warning('Orders cancelled', `${selectedOrders.length} orders have been cancelled`)
          }
          break
      }
      setSelectedOrders([])
    } catch (err) {
      toastError('Action failed', 'Failed to perform bulk action. Please try again.')
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus, 'admin-1', `Status updated to ${newStatus}`)
      success('Status updated', `Order status has been updated to ${newStatus}`)
    } catch (err) {
      toastError('Update failed', 'Failed to update order status. Please try again.')
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId, 'admin-1', 'Order cancelled by admin')
      warning('Order cancelled', 'Order has been cancelled successfully')
    } catch (err) {
      toastError('Cancellation failed', 'Failed to cancel order. Please try again.')
    }
  }

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchValue || 
      order.id?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.items[0]?.productName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchValue.toLowerCase())
    
    const statusFilter = orderFilters.status || 'all'
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AdminAuthGuard>
    )
  }

  if (error) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Failed to load orders. Please try again later.'}
            </p>
            <button
              onClick={() => fetchOrders()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminAuthGuard>
    )
  }

  // Available filters
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ]

  // Tab configuration
  const tabs = [
    { key: 'overview', label: 'Overview', count: orders.length },
    { key: 'orders', label: 'All Orders', count: orders.length },
    { key: 'pending', label: 'Pending', count: orderStats.pendingOrders || 0 },
    { key: 'processing', label: 'Processing', count: orderStats.processingOrders || 0 }
  ]

  return (
    <AdminAuthGuard>
      <ModernSubpageLayout
        title="Order Management"
        subtitle="Manage and track all customer orders"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders' }
        ]}
        showAddButton
        addButtonText="New Order"
        onAddClick={handleAddOrder}
        showExportButton
        onExportClick={handleExport}
        headerActions={
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders || 0}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orderStats.pendingOrders || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-yellow-600">
                <Activity className="h-4 w-4 mr-1" />
                <span>Needs attention</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${orderStats.totalRevenue?.toLocaleString() || '0'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+8% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-gray-900">{orderStats.shippedOrders || 0}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-purple-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>On schedule</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            filters={filters}
            activeFilters={orderFilters}
            onFilterChange={handleFilterChange}
          />

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Trends Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder - Order trends over time</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-gray-500">{order.customer?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${order.totalAmount}</p>
                        <StatusBadge status={order.status} variant="dot" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Bulk Actions */}
              {selectedOrders.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      {selectedOrders.length} order(s) selected
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('process')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Process
                      </button>
                      <button
                        onClick={() => handleBulkAction('ship')}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        Ship
                      </button>
                      <button
                        onClick={() => handleBulkAction('deliver')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Deliver
                      </button>
                      <button
                        onClick={() => handleBulkAction('cancel')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders DataTable */}
              <DataTable
                data={filteredOrders}
                columns={[
                  {
                    key: 'id',
                    label: 'Order',
                    render: (value: string, order: any) => (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                      </div>
                    )
                  },
                  {
                    key: 'customer',
                    label: 'Customer',
                    render: (value: any, order: any) => (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{order.customer?.email || 'No email'}</div>
                      </div>
                    )
                  },
                  {
                    key: 'items',
                    label: 'Product',
                    render: (value: any, order: any) => (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.items[0]?.productName || 'No product'}</div>
                        <div className="text-sm text-gray-500">{order.supplier?.name || 'No supplier'}</div>
                      </div>
                    )
                  },
                  {
                    key: 'totalAmount',
                    label: 'Amount',
                    render: (amount: number) => (
                      <span className="text-sm font-medium text-gray-900">${amount}</span>
                    )
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (status: string) => (
                      <StatusBadge status={status} variant="pill" />
                    )
                  },
                  {
                    key: 'createdAt',
                    label: 'Date',
                    render: (date: any) => (
                      <span className="text-sm text-gray-500">
                        {date ? (date instanceof Date ? date.toLocaleDateString() : 'Invalid date') : 'Unknown date'}
                      </span>
                    )
                  }
                ]}
                actions={[
                  {
                    key: 'view',
                    label: 'View',
                    icon: Eye,
                    onClick: (order: any) => router.push(`/admin/orders/${order.id}`)
                  },
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: Edit,
                    onClick: (order: any) => router.push(`/admin/orders/${order.id}/edit`)
                  },
                  {
                    key: 'cancel',
                    label: 'Cancel',
                    icon: Trash2,
                    onClick: (order: any) => handleCancelOrder(order.id)
                  }
                ]}
              />
            </div>
          )}
        </div>
      </ModernSubpageLayout>
    </AdminAuthGuard>
  )
}
