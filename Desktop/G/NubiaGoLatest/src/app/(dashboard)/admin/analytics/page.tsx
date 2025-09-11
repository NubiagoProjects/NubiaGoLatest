'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Download,
  RefreshCw,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useToast } from '@/components/ui/toast'

const StatCard = ({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
    <div className={`mt-2 flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
      {change > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      <span>{Math.abs(change)}% from last period</span>
    </div>
  </div>
);

export default function AdminAnalyticsPage() {
  const { loading } = useAdminDashboardStore()
  const { success, error: errorToast } = useToast()
  
  const [timeRange, setTimeRange] = useState('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock analytics data
  const analytics = {
    summary: {
      totalRevenue: 125000,
      totalOrders: 1250,
      totalUsers: 850,
      conversionRate: 3.2
    },
    salesOverTime: [
      { name: 'Jan', sales: 4000, orders: 240 },
      { name: 'Feb', sales: 3000, orders: 198 },
      { name: 'Mar', sales: 5000, orders: 300 },
      { name: 'Apr', sales: 4500, orders: 278 },
      { name: 'May', sales: 6000, orders: 389 },
      { name: 'Jun', sales: 5500, orders: 349 }
    ],
    topProducts: [
      { name: 'Product A', sales: 1200, revenue: 24000 },
      { name: 'Product B', sales: 980, revenue: 19600 },
      { name: 'Product C', sales: 750, revenue: 15000 }
    ],
    recentActivities: [
      { type: 'order', description: 'New order #1234', time: '2 minutes ago' },
      { type: 'user', description: 'New user registration', time: '5 minutes ago' },
      { type: 'payment', description: 'Payment received', time: '10 minutes ago' }
    ]
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      success('Analytics refreshed successfully')
    } catch (error) {
      errorToast('Failed to refresh analytics')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = () => {
    success('Export started', 'Analytics data export will be ready shortly')
    const data = JSON.stringify(analytics, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const headerActions = (
    <div className="flex items-center space-x-3">
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
    </div>
  )

  if (loading && !analytics) {
    return (
      <AdminAuthGuard>
        <ModernSubpageLayout title="Analytics Dashboard" subtitle="Monitor business performance and trends" headerActions={headerActions}>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </ModernSubpageLayout>
      </AdminAuthGuard>
    )
  }

  return (
    <AdminAuthGuard>
      <ModernSubpageLayout
        title="Analytics Dashboard"
        subtitle="Monitor business performance and trends"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }]}
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`$${analytics.summary.totalRevenue?.toLocaleString() || '0'}`} change={12.5} icon={DollarSign} color="green" />
            <StatCard title="Total Orders" value={analytics.summary.totalOrders?.toLocaleString() || '0'} change={8.2} icon={ShoppingBag} color="blue" />
            <StatCard title="Total Users" value={analytics.summary.totalUsers?.toLocaleString() || '0'} change={15.3} icon={Users} color="purple" />
            <StatCard title="Conversion Rate" value={`${analytics.summary.conversionRate || 0}%`} change={5.7} icon={TrendingUp} color="orange" />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-3 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.salesOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} contentStyle={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar dataKey="sales" fill="#3b82f6" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="#a78bfa" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analytics.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 truncate">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right pl-4">
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
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {analytics.recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`p-2 bg-${activity.type === 'order' ? 'green' : activity.type === 'user' ? 'blue' : 'purple'}-100 rounded-full`}>
                    {activity.type === 'order' && <ShoppingBag className="h-4 w-4 text-green-600" />}
                    {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'milestone' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  {activity.value && <span className="text-sm font-semibold text-gray-800">{activity.value}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModernSubpageLayout>
    </AdminAuthGuard>
  )
}
