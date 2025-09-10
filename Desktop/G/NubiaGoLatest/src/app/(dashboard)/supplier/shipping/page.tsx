'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, Package, MapPin, Calculator, Printer, 
  Download, Search, Filter, Plus, RefreshCw, Loader2
} from 'lucide-react'
// Button and Input components replaced with standard HTML elements
import { ShippingCalculator } from '@/components/shipping/shipping-calculator'
import { LabelGenerator } from '@/components/shipping/label-generator'
import { TrackingWidget } from '@/components/shipping/tracking-widget'
import { useShippingStore } from '@/store/shipping'
import { useLogistics } from '@/hooks/useLogistics'
import { toast } from '@/lib/utils'

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
  const [activeTab, setActiveTab] = useState<'calculator' | 'labels' | 'tracking' | 'orders'>('calculator')
  const [orders, setOrders] = useState<ShippingOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
      toast.error('Failed to load shipping orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipping Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage shipping operations and track packages</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rate Calculator</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRate ? '$' + selectedRate.rate.toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'calculator', label: 'Rate Calculator', icon: Calculator },
                { id: 'labels', label: 'Generate Labels', icon: Printer },
                { id: 'tracking', label: 'Track Packages', icon: Search },
                { id: 'orders', label: 'Shipping Orders', icon: Package },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
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
            {/* Rate Calculator Tab */}
            {activeTab === 'calculator' && (
              <ShippingCalculator
                onRateSelect={(rate) => {
                  console.log('Selected rate:', rate)
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

            {/* Shipping Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={loadShippingOrders}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tracking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.trackingNumber ? (
                              <div>
                                <div className="font-medium">{order.trackingNumber}</div>
                                <div className="text-gray-500">{order.carrier?.toUpperCase()}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No tracking</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {order.status === 'pending' && (
                                <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                  <Printer className="h-4 w-4 mr-1" />
                                  Generate Label
                                </button>
                              )}
                              {order.trackingNumber && (
                                <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                  <Truck className="h-4 w-4 mr-1" />
                                  Track Package
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No shipping orders found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
