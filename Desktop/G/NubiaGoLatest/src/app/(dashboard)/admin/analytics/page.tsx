'use client'

import { useState } from 'react'
import { ModernDashboardLayout } from '@/components/dashboard/ModernDashboardLayout'
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: 'Dashboard', path: '/admin' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/users' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { id: 'products', icon: ShoppingBag, label: 'Products', path: '/admin/products' },
    { id: 'suppliers', icon: Users, label: 'Suppliers', path: '/admin/suppliers' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
    { id: 'settings', icon: BarChart3, label: 'Settings', path: '/admin/settings' }
  ]

  const analyticsData = {
    revenue: {
      current: 125000,
      previous: 98000,
      change: 27.6
    },
    orders: {
      current: 1250,
      previous: 980,
      change: 27.6
    },
    users: {
      current: 8500,
      previous: 7200,
      change: 18.1
    },
    conversion: {
      current: 3.2,
      previous: 2.8,
      change: 14.3
    }
  }

  const chartData = [
    { month: 'Jan', revenue: 45000, orders: 450, users: 1200 },
    { month: 'Feb', revenue: 52000, orders: 520, users: 1350 },
    { month: 'Mar', revenue: 48000, orders: 480, users: 1280 },
    { month: 'Apr', revenue: 61000, orders: 610, users: 1450 },
    { month: 'May', revenue: 55000, orders: 550, users: 1380 },
    { month: 'Jun', revenue: 67000, orders: 670, users: 1520 }
  ]

  const topProducts = [
    { name: 'Wireless Headphones', sales: 1250, revenue: 125000 },
    { name: 'Smart Watch', sales: 980, revenue: 98000 },
    { name: 'Laptop Stand', sales: 750, revenue: 45000 },
    { name: 'USB-C Hub', sales: 650, revenue: 32500 },
    { name: 'Bluetooth Speaker', sales: 580, revenue: 29000 }
  ]

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    // Export analytics data
    const data = JSON.stringify(analyticsData, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}.json`
    a.click()
  }

  return (
    <ModernDashboardLayout 
      sidebarItems={sidebarItems}
      title="Analytics Dashboard"
      subtitle="Monitor business performance and trends"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track key metrics and business performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analyticsData.revenue.current.toLocaleString()}
                </p>
                <p className={`text-sm ${analyticsData.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.revenue.change > 0 ? '+' : ''}{analyticsData.revenue.change}% from last period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.orders.current.toLocaleString()}
                </p>
                <p className={`text-sm ${analyticsData.orders.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.orders.change > 0 ? '+' : ''}{analyticsData.orders.change}% from last period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.users.current.toLocaleString()}
                </p>
                <p className={`text-sm ${analyticsData.users.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.users.change > 0 ? '+' : ''}{analyticsData.users.change}% from last period
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.conversion.current}%
                </p>
                <p className={`text-sm ${analyticsData.conversion.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.conversion.change > 0 ? '+' : ''}{analyticsData.conversion.change}% from last period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-orange-500 rounded-t-sm transition-all hover:bg-orange-600"
                    style={{ height: `${(item.revenue / 70000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New order #12345 received</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
              <span className="text-sm font-semibold text-green-600">$299.99</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registration</p>
                <p className="text-xs text-gray-600">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Revenue milestone reached</p>
                <p className="text-xs text-gray-600">1 hour ago</p>
              </div>
              <span className="text-sm font-semibold text-purple-600">$100K</span>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
