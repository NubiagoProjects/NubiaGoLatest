'use client'

import { useState } from 'react'
import { ModernDashboardLayout } from '@/components/dashboard/ModernDashboardLayout'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Grid3X3,
  Truck,
  CreditCard,
  MessageSquare,
  Settings
} from 'lucide-react'

export default function SupplierAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  const sidebarItems = [
    { id: 'overview', icon: Grid3X3, label: 'Dashboard', path: '/supplier' },
    { id: 'products', icon: Package, label: 'Products', path: '/supplier/products' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders', path: '/supplier/orders' },
    { id: 'inventory', icon: BarChart3, label: 'Inventory', path: '/supplier/inventory' },
    { id: 'shipping', icon: Truck, label: 'Shipping', path: '/supplier/shipping' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', path: '/supplier/analytics' },
    { id: 'customers', icon: Users, label: 'Customers', path: '/supplier/customers' },
    { id: 'payments', icon: CreditCard, label: 'Payments', path: '/supplier/payments' },
    { id: 'support', icon: MessageSquare, label: 'Support', path: '/supplier/support' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/supplier/settings' }
  ]

  const analyticsData = {
    revenue: { current: 45000, previous: 38000, change: 18.4 },
    orders: { current: 450, previous: 380, change: 18.4 },
    products: { current: 125, previous: 118, change: 5.9 },
    customers: { current: 280, previous: 245, change: 14.3 }
  }

  const salesData = [
    { month: 'Jan', revenue: 25000, orders: 250 },
    { month: 'Feb', revenue: 32000, orders: 320 },
    { month: 'Mar', revenue: 28000, orders: 280 },
    { month: 'Apr', revenue: 41000, orders: 410 },
    { month: 'May', revenue: 35000, orders: 350 },
    { month: 'Jun', revenue: 45000, orders: 450 }
  ]

  const topProducts = [
    { name: 'Wireless Headphones', sales: 125, revenue: 12500 },
    { name: 'Smart Watch', sales: 98, revenue: 14700 },
    { name: 'Bluetooth Speaker', sales: 75, revenue: 3750 },
    { name: 'USB-C Cable', sales: 65, revenue: 520 },
    { name: 'Phone Case', sales: 58, revenue: 1160 }
  ]

  const customerInsights = [
    { segment: 'New Customers', count: 85, percentage: 30.4 },
    { segment: 'Returning Customers', count: 125, percentage: 44.6 },
    { segment: 'VIP Customers', count: 70, percentage: 25.0 }
  ]

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    const data = JSON.stringify({ analyticsData, salesData, topProducts }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplier-analytics-${timeRange}.json`
    a.click()
  }

  return (
    <ModernDashboardLayout 
      sidebarItems={sidebarItems}
      title="Supplier Analytics"
      subtitle="Track your business performance and growth"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor your supplier performance and trends</p>
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
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.products.current}
                </p>
                <p className={`text-sm ${analyticsData.products.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.products.change > 0 ? '+' : ''}{analyticsData.products.change}% from last period
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.customers.current}
                </p>
                <p className={`text-sm ${analyticsData.customers.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.customers.change > 0 ? '+' : ''}{analyticsData.customers.change}% from last period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
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
              {salesData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-orange-500 rounded-t-sm transition-all hover:bg-orange-600"
                    style={{ height: `${(item.revenue / 50000) * 200}px` }}
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

        {/* Customer Insights */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerInsights.map((segment, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{segment.count}</div>
                <div className="text-sm text-gray-600 mb-2">{segment.segment}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{segment.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Growth Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">+18.4%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Growth</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">+18.4%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Growth</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">+14.3%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Best performing month: June with $45,000 revenue</p>
                <p>• Top product: Smart Watch generating $14,700</p>
                <p>• 44.6% of customers are returning buyers</p>
                <p>• Average order value increased by 12%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
