'use client'

import { useState } from 'react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DataTable from '@/components/dashboard/DataTable'
import { 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react'

export default function SupplierPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filterOptions = [
    {
      key: 'status',
      label: 'Payment Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'failed', label: 'Failed' }
      ]
    },
    {
      key: 'method',
      label: 'Payment Method',
      options: [
        { value: 'all', label: 'All Methods' },
        { value: 'Credit Card', label: 'Credit Card' },
        { value: 'PayPal', label: 'PayPal' },
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Mobile Money', label: 'Mobile Money' }
      ]
    }
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

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const handleExport = () => {
    console.log('Exporting payment data...')
    // TODO: Implement export functionality
  }

  const handleRefresh = () => {
    console.log('Refreshing payment data...')
    // TODO: Implement refresh functionality
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const statusFilter = activeFilters.status || 'all'
    const methodFilter = activeFilters.method || 'all'
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing').length
  const totalFees = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.fee, 0)
  const successRate = ((payments.filter(p => p.status === 'completed').length / payments.length) * 100).toFixed(1)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/supplier' },
    { label: 'Payments', href: '/supplier/payments' }
  ]

  const paymentColumns = [
    { key: 'id', label: 'Payment ID' },
    { 
      key: 'orderId', 
      label: 'Order ID',
      render: (value: string) => (
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{value}</span>
      )
    },
    { key: 'customer', label: 'Customer' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value: number) => (
        <span className="font-medium">₦{value.toFixed(2)}</span>
      )
    },
    { key: 'method', label: 'Method' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <StatusBadge status={value} variant="default" />
      )
    },
    { key: 'date', label: 'Date' },
    { 
      key: 'fee', 
      label: 'Fee',
      render: (value: number) => (
        <span>₦{value.toFixed(2)}</span>
      )
    }
  ]

  const paymentActions = [
    { key: 'view', label: 'View', icon: Eye, onClick: (payment: any) => console.log('View payment:', payment.id) }
  ]

  return (
    <ModernSubpageLayout
      title="Payment Management"
      subtitle="Monitor and manage your payment transactions"
      breadcrumbs={breadcrumbs}
      showExportButton
      onExportClick={handleExport}
      headerActions={
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">₦{totalFees.toFixed(2)}</p>
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

        {/* Search and Filters */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search payments by ID, order, or customer..."
          filters={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Payments Table */}
        <DataTable
          data={filteredPayments}
          columns={paymentColumns}
          actions={paymentActions}
        />

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
    </ModernSubpageLayout>
  )
}
