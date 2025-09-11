'use client'

import { useState, useEffect } from 'react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DataTable from '@/components/dashboard/DataTable'
import { 
  Truck, Package, MapPin, Calculator, Printer, 
  Download, Search, Filter, Plus, RefreshCw, Loader2, Eye
} from 'lucide-react'
// Button and Input components replaced with standard HTML elements
import { ShippingCalculator } from '@/components/shipping/shipping-calculator'
import { LabelGenerator } from '@/components/shipping/label-generator'
import { TrackingWidget } from '@/components/shipping/tracking-widget'
import { useShippingStore } from '@/store/shipping'
import { useLogistics } from '@/hooks/useLogistics'

interface ShippingOrder {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  carrier?: string
  carrierCode?: string
  createdAt: string
  estimatedDelivery?: string
}

export default function SupplierShippingPage() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'labels' | 'tracking' | 'orders'>('orders')
  const [orders, setOrders] = useState<ShippingOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: 'all'
  })

  const { selectedRate } = useShippingStore()
  const { rates, loading: ratesLoading, error: ratesError, getRates, clearRates } = useLogistics()

  useEffect(() => {
    loadShippingOrders()
  }, [])

  const loadShippingOrders = async () => {
    setLoading(true)
    try {
      // Mock data for demo - replace with actual API call
      const mockOrders: ShippingOrder[] = [
        {
          id: '1',
          orderId: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          status: 'shipped',
          trackingNumber: 'TRK123456789',
          carrier: 'USPS',
          carrierCode: 'usps',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          orderId: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          orderId: 'ORD-003',
          customerName: 'Bob Johnson',
          customerEmail: 'bob@example.com',
          status: 'delivered',
          trackingNumber: 'TRK987654321',
          carrier: 'FedEx',
          carrierCode: 'fedex',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error loading shipping orders:', error)
      // TODO: Implement toast notification
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const handleExport = () => {
    console.log('Exporting shipping data...')
    // TODO: Implement export functionality
  }

  const handleRefresh = () => {
    loadShippingOrders()
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = activeFilters.status === 'all' || order.status === activeFilters.status
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'shipped': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅'
      case 'shipped': return '📦'
      case 'pending': return '⏳'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/supplier' },
    { label: 'Shipping', href: '/supplier/shipping' }
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ]

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (order: ShippingOrder) => (
        <div className="font-medium text-gray-900">{order.orderId}</div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order: ShippingOrder) => (
        <div>
          <div className="font-medium text-gray-900">{order.customerName}</div>
          <div className="text-sm text-gray-500">{order.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: ShippingOrder) => (
        <StatusBadge status={order.status} />
      )
    },
    {
      key: 'tracking',
      label: 'Tracking',
      render: (order: ShippingOrder) => (
        order.trackingNumber ? (
          <div>
            <div className="font-medium text-gray-900">{order.trackingNumber}</div>
            <div className="text-sm text-gray-500">{order.carrier?.toUpperCase()}</div>
          </div>
        ) : (
          <span className="text-gray-400">No tracking</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (order: ShippingOrder) => (
        <div className="text-gray-900">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ]

  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: Eye,
      onClick: (order: ShippingOrder) => {
        console.log('Viewing order:', order.id)
        // TODO: Navigate to order details
      }
    },
    {
      key: 'track',
      label: 'Track',
      icon: Truck,
      onClick: (order: ShippingOrder) => {
        console.log('Tracking order:', order.id)
        // TODO: Open tracking modal
      },
      show: (order: ShippingOrder) => !!order.trackingNumber
    },
    {
      key: 'label',
      label: 'Generate Label',
      icon: Printer,
      onClick: (order: ShippingOrder) => {
        console.log('Generating label for order:', order.id)
        // TODO: Generate shipping label
      },
      show: (order: ShippingOrder) => order.status === 'pending'
    }
  ]

  return (
    <ModernSubpageLayout
      title="Shipping Dashboard"
      subtitle="Manage shipping operations and track packages"
      breadcrumbs={breadcrumbs}
      showExportButton
      onExportClick={handleExport}
      headerActions={
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Shipped</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'orders', label: 'Shipping Orders', icon: Package },
                { id: 'calculator', label: 'Rate Calculator', icon: Calculator },
                { id: 'labels', label: 'Generate Labels', icon: Printer },
                { id: 'tracking', label: 'Track Packages', icon: Search },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Shipping Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <FilterBar
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={filters}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />

                <DataTable
                  data={filteredOrders}
                  columns={columns}
                  actions={actions}
                  loading={loading}
                />

                {filteredOrders.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No shipping orders found</p>
                  </div>
                )}
              </div>
            )}

            {/* Rate Calculator Tab */}
            {activeTab === 'calculator' && (
              <ShippingCalculator
                onRateSelect={(rate) => {
                  console.log('Shipping rate selected:', rate)
                  // TODO: Implement rate selection
                }}
              />
            )}

            {/* Generate Labels Tab */}
            {activeTab === 'labels' && (
              <LabelGenerator />
            )}

            {/* Track Packages Tab */}
            {activeTab === 'tracking' && (
              <TrackingWidget />
            )}
          </div>
        </div>
      </div>
    </ModernSubpageLayout>
  )
} 
