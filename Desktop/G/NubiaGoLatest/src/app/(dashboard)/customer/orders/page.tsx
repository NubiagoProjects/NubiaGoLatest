'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, Eye, Truck, Download, MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'
import FilterBar from '@/components/dashboard/FilterBar'

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    // Simulate loading orders
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001',
          status: 'delivered',
          items: [
            { name: 'Wireless Headphones', quantity: 1, price: 99.99 }
          ],
          total: 99.99,
          createdAt: '2024-01-15',
          estimatedDelivery: '2024-01-20',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          status: 'shipped',
          items: [
            { name: 'Smart Watch', quantity: 1, price: 199.99 }
          ],
          total: 199.99,
          createdAt: '2024-01-20',
          estimatedDelivery: '2024-01-25',
          trackingNumber: 'TRK987654321'
        },
        {
          id: 'ORD-003',
          status: 'processing',
          items: [
            { name: 'Laptop Stand', quantity: 2, price: 49.99 }
          ],
          total: 99.98,
          createdAt: '2024-01-22',
          estimatedDelivery: '2024-01-27'
        },
        {
          id: 'ORD-004',
          status: 'pending',
          items: [
            { name: 'Phone Case', quantity: 1, price: 24.99 }
          ],
          total: 24.99,
          createdAt: '2024-01-25',
          estimatedDelivery: '2024-01-30'
        },
        {
          id: 'ORD-005',
          status: 'cancelled',
          items: [
            { name: 'Bluetooth Speaker', quantity: 1, price: 79.99 }
          ],
          total: 79.99,
          createdAt: '2024-01-18',
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !activeFilters.status || order.status === activeFilters.status
    
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium text-gray-900">#{value}</div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (items: any[], row: Order) => (
        <div>
          <div className="text-sm text-gray-900">
            {items.map(item => item.name).join(', ')}
          </div>
          <div className="text-xs text-gray-500">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status: string) => <StatusBadge status={status} />
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-gray-900">${value.toFixed(2)}</div>
      )
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'trackingNumber',
      label: 'Tracking',
      render: (value: string, row: Order) => (
        value ? (
          <div className="text-sm text-gray-900 font-mono">{value}</div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    }
  ]

  const actions = [
    {
      key: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (order: Order) => router.push(`/customer/orders/${order.id}`)
    },
    {
      key: 'track',
      label: 'Track Order',
      icon: Truck,
      onClick: (order: Order) => router.push(`/customer/orders/${order.id}/tracking`)
    }
  ]

  const handleExport = () => {
    console.log('Exporting orders...')
  }

  const emptyState = (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm || Object.values(activeFilters).some(Boolean)
          ? 'Try adjusting your search or filter criteria.'
          : 'Start shopping to see your orders here.'
        }
      </p>
      {!searchTerm && !Object.values(activeFilters).some(Boolean) && (
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <ModernSubpageLayout
      title="Orders"
      subtitle="Track and manage your orders"
      backUrl="/customer"
      showExportButton
      onExportClick={handleExport}
      breadcrumbs={[
        { label: 'Dashboard', href: '/customer' },
        { label: 'Orders' }
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search orders by ID or item name..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
          onClearFilters={() => setActiveFilters({})}
          showDateRange
        />

        {/* Orders Table */}
        <DataTable
          columns={columns}
          data={filteredOrders}
          actions={actions}
          loading={loading}
          emptyState={emptyState}
        />
      </div>
    </ModernSubpageLayout>
  )
} 
