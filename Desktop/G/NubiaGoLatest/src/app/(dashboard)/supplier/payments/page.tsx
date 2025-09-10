'use client'

import { useState } from 'react'
import { ModernDashboardLayout } from '@/components/dashboard/ModernDashboardLayout'
import { 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Grid3X3,
  Package,
  ShoppingBag,
  BarChart3,
  Truck,
  Users,
  MessageSquare,
  Settings
} from 'lucide-react'

export default function SupplierPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

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

  const payments = [
    {
      id: 'PAY-001',
      orderId: 'ORD-12345',
      customer: 'John Smith',
      amount: 299.99,
      method: 'Credit Card',
      status: 'completed',
      date: '2024-01-22',
      fee: 8.99
    },
    {
      id: 'PAY-002',
      orderId: 'ORD-12346',
      customer: 'Sarah Johnson',
      amount: 149.50,
      method: 'PayPal',
      status: 'pending',
      date: '2024-01-22',
      fee: 4.49
    },
    {
      id: 'PAY-003',
      orderId: 'ORD-12347',
      customer: 'Mike Wilson',
      amount: 75.00,
      method: 'Bank Transfer',
      status: 'completed',
      date: '2024-01-21',
      fee: 2.25
    },
    {
      id: 'PAY-004',
      orderId: 'ORD-12348',
      customer: 'Emma Davis',
      amount: 450.00,
      method: 'Credit Card',
      status: 'failed',
      date: '2024-01-21',
      fee: 0.00
    },
    {
      id: 'PAY-005',
      orderId: 'ORD-12349',
      customer: 'Alex Brown',
      amount: 199.99,
      method: 'Mobile Money',
      status: 'processing',
      date: '2024-01-20',
      fee: 5.99
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing').length
  const totalFees = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.fee, 0)
  const successRate = ((payments.filter(p => p.status === 'completed').length / payments.length) * 100).toFixed(1)

  return (
    <ModernDashboardLayout 
      sidebarItems={sidebarItems}
      title="Payment Management"
      subtitle="Track payments and financial transactions"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">Monitor and manage your payment transactions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
                <p className="text-sm text-yellow-600">Awaiting processing</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction Fees</p>
                <p className="text-2xl font-bold text-gray-900">${totalFees.toFixed(2)}</p>
                <p className="text-sm text-red-600">Platform charges</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                <p className="text-sm text-green-600">Payment completion</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        {payment.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{payment.method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{payment.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${payment.fee.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Summary */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Credit Cards</h4>
              <p className="text-2xl font-bold text-gray-900 mt-1">65%</p>
              <p className="text-sm text-gray-600">of transactions</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Digital Wallets</h4>
              <p className="text-2xl font-bold text-gray-900 mt-1">25%</p>
              <p className="text-sm text-gray-600">of transactions</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900">Bank Transfer</h4>
              <p className="text-2xl font-bold text-gray-900 mt-1">10%</p>
              <p className="text-sm text-gray-600">of transactions</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payment Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment completed for Order #ORD-12345</p>
                <p className="text-xs text-gray-600">2 minutes ago • $299.99</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment pending for Order #ORD-12346</p>
                <p className="text-xs text-gray-600">15 minutes ago • $149.50</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment failed for Order #ORD-12348</p>
                <p className="text-xs text-gray-600">1 hour ago • $450.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
