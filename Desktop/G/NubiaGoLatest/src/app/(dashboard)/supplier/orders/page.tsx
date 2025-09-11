'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Eye, Edit, Truck, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign } from 'lucide-react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'
import FilterBar from '@/components/dashboard/FilterBar'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  total: number
  items: number
  paymentStatus: 'paid' | 'pending' | 'failed'
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Simulate loading orders data
    const loadOrders = async () => {
      setLoading(true)
      
      // Mock orders data - in real app, fetch from API
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          status: 'processing',
          orderDate: '2024-01-15T10:30:00Z',
          total: 159.99,
          items: 3,
          paymentStatus: 'paid'
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          status: 'shipped',
          orderDate: '2024-01-14T14:20:00Z',
          total: 89.50,
          items: 2,
          paymentStatus: 'paid'
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          customerName: 'Bob Johnson',
          customerEmail: 'bob@example.com',
          status: 'delivered',
          orderDate: '2024-01-13T09:15:00Z',
          total: 245.00,
          items: 5,
          paymentStatus: 'paid'
        },
        {
          id: '4',
          orderNumber: 'ORD-004',
          customerName: 'Alice Brown',
          customerEmail: 'alice@example.com',
          status: 'pending',
          orderDate: '2024-01-16T16:45:00Z',
          total: 67.25,
          items: 1,
          paymentStatus: 'pending'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrders(mockOrders)
      setLoading(false)
    }

    loadOrders()
  }, [])


  const breadcrumbs = [
    { label: 'Supplier Dashboard', href: '/supplier' },
    { label: 'Orders', href: '/supplier/orders' }
  ]

  const handleExport = async () => {
    console.log('Exporting orders...')
    // TODO: Implement orders export functionality
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filterOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ]

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (order: Order) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
          <div className="text-sm text-gray-500">{order.items} items</div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order: Order) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
          <div className="text-sm text-gray-500">{order.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: Order) => <StatusBadge status={order.status} />
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (order: Order) => <StatusBadge status={order.paymentStatus} />
    },
    {
      key: 'total',
      label: 'Total',
      render: (order: Order) => (
        <span className="text-sm font-medium text-gray-900">
          ${order.total.toFixed(2)}
        </span>
      )
    },
    {
      key: 'orderDate',
      label: 'Date',
      render: (order: Order) => (
        <span className="text-sm text-gray-500">
          {new Date(order.orderDate).toLocaleDateString()}
        </span>
      )
    }
  ]

  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: Eye,
      onClick: (order: Order) => window.location.href = `/supplier/orders/${order.id}`
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (order: Order) => console.log('Edit order:', order.id)
    }
  ]

  if (loading) {
    return (
      <ModernSubpageLayout
        title="Orders"
        subtitle="Manage your customer orders"
        breadcrumbs={breadcrumbs}
        showExportButton={true}
        onExportClick={handleExport}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </ModernSubpageLayout>
    )
  }

  return (
    <ModernSubpageLayout
      title="Orders"
      subtitle="Manage your customer orders"
      breadcrumbs={breadcrumbs}
      showExportButton={true}
      onExportClick={handleExport}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Shipped</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: filterOptions
          }
        ]}
        activeFilters={{ status: statusFilter }}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            setStatusFilter(value)
          }
        }}
      />

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here once customers start placing them.'}
            </p>
          </div>
        ) : (
          <DataTable
            data={filteredOrders}
            columns={columns}
            actions={actions}
            loading={loading}
          />
        )}
      </div>
    </ModernSubpageLayout>
  )
}
