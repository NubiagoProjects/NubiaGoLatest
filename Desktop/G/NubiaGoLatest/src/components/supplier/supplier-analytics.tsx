'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, 
  Star, Eye, ShoppingCart, Users, Truck
} from 'lucide-react'

interface SupplierAnalyticsData {
  revenue: {
    total: number
    change: number
    trend: 'up' | 'down'
    monthly: Array<{ month: string; value: number }>
  }
  orders: {
    total: number
    change: number
    trend: 'up' | 'down'
    status: Array<{ status: string; count: number }>
  }
  products: {
    total: number
    active: number
    categories: Array<{ category: string; count: number }>
    topSelling: Array<{
      name: string
      sales: number
      revenue: number
      rating: number
    }>
  }
  customers: {
    total: number
    new: number
    repeat: number
    growth: Array<{ month: string; customers: number }>
  }
  inventory: {
    lowStock: number
    outOfStock: number
    totalValue: number
    categories: Array<{ category: string; value: number }>
  }
}

interface KPICardProps {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: React.ReactNode
  color: string
}

const KPICard = ({ title, value, change, trend, icon, color }: KPICardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center mt-2">
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

export default function SupplierAnalytics() {
  const [data, setData] = useState<SupplierAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    // Simulate loading supplier analytics data
    setTimeout(() => {
      setData({
        revenue: {
          total: 2999.85,
          change: 12.5,
          trend: 'up',
          monthly: [
            { month: 'Jan', value: 1800 },
            { month: 'Feb', value: 2100 },
            { month: 'Mar', value: 2400 },
            { month: 'Apr', value: 2200 },
            { month: 'May', value: 2800 },
            { month: 'Jun', value: 2999.85 }
          ]
        },
        orders: {
          total: 15,
          change: 8.3,
          trend: 'up',
          status: [
            { status: 'Delivered', count: 8 },
            { status: 'Shipped', count: 3 },
            { status: 'Processing', count: 2 },
            { status: 'Pending', count: 2 }
          ]
        },
        products: {
          total: 8,
          active: 7,
          categories: [
                    { category: 'Women', count: 8 },
        { category: 'Men', count: 5 },
        { category: 'Mother & Child', count: 3 },
        { category: 'Home & Living', count: 4 },
        { category: 'Cosmetics', count: 6 },
        { category: 'Shoes & Bags', count: 4 },
        { category: 'Electronics', count: 7 }
          ],
          topSelling: [
            { name: 'Wireless Headphones', sales: 23, revenue: 2297.77, rating: 4.8 },
            { name: 'Smart Watch', sales: 8, revenue: 1599.92, rating: 4.6 },
            { name: 'Bluetooth Speaker', sales: 12, revenue: 599.88, rating: 4.4 }
          ]
        },
        customers: {
          total: 45,
          new: 12,
          repeat: 33,
          growth: [
            { month: 'Jan', customers: 30 },
            { month: 'Feb', customers: 35 },
            { month: 'Mar', customers: 38 },
            { month: 'Apr', customers: 40 },
            { month: 'May', customers: 42 },
            { month: 'Jun', customers: 45 }
          ]
        },
        inventory: {
          lowStock: 2,
          outOfStock: 1,
          totalValue: 4500,
          categories: [
                    { category: 'Women', value: 4200 },
        { category: 'Men', value: 2800 },
        { category: 'Mother & Child', value: 1800 },
        { category: 'Home & Living', value: 2200 },
        { category: 'Cosmetics', value: 3100 },
        { category: 'Shoes & Bags', value: 2500 },
        { category: 'Electronics', value: 3800 }
          ]
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!data) return null

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${data.revenue.total.toLocaleString()}`}
          change={data.revenue.change}
          trend={data.revenue.trend}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <KPICard
          title="Total Orders"
          value={data.orders.total.toLocaleString()}
          change={data.orders.change}
          trend={data.orders.trend}
          icon={<ShoppingBag className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <KPICard
          title="Active Products"
          value={data.products.active.toLocaleString()}
          change={5.2}
          trend="up"
          icon={<Package className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <KPICard
          title="Total Customers"
          value={data.customers.total.toLocaleString()}
          change={15.2}
          trend="up"
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.revenue.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.customers.growth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.orders.status}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.products.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="count"
              >
                {data.products.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.products.topSelling.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1">{product.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock Items</span>
              <span className="text-lg font-semibold text-yellow-600">{data.inventory.lowStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <span className="text-lg font-semibold text-red-600">{data.inventory.outOfStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="text-lg font-semibold text-green-600">${data.inventory.totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="text-lg font-semibold text-blue-600">{data.customers.new}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Repeat Customers</span>
              <span className="text-lg font-semibold text-green-600">{data.customers.repeat}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className="text-lg font-semibold text-purple-600">
                {((data.customers.repeat / data.customers.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Add New Product
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Orders
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
