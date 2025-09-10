'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Calendar, User, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { OrderService } from '@/lib/services/order.service'
import { useAuth } from '@/hooks/useAuth'
import { Order as OrderType } from '@/types'

export default function OrdersPage() {
  const router = useRouter()
  const { error } = useToast()
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        
        if (!user?.uid) {
          setOrders([])
          return
        }

        const orderService = new OrderService()
        const { orders: userOrders } = await orderService.getUserOrders(user.uid, 1, 50)
        
        setOrders(userOrders)
      } catch (err) {
        console.error('Error fetching orders:', err)
        error('Failed to load orders')
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user?.uid, error])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100 border-green-200'
      case 'shipped': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'processing': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'pending': return 'text-gray-600 bg-gray-100 border-gray-200'
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Package className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length
  const pendingOrders = orders.filter(order => order.status === 'pending').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-400 rounded-full animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading enterprise orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform duration-200" />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-xl text-gray-600 mt-2">Enterprise-grade order tracking and management</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivered Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Filters */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-lg"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3">
                <Filter className="h-5 w-5" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Premium Orders List */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredOrders.length} Orders Found
              </h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-8 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-2 capitalize">{order.status}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Customer</p>
                              <p className="font-semibold text-gray-900">{`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-bold text-gray-900">${order.total.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Payment</p>
                              <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Order Items ({order.items.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {order.items.map((item) => (
                                                              <div key={item.productId} className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="font-semibold text-gray-900 mb-1">{item.product.name}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <Link
                      href={`/orders/${order.id}`}
                      className="p-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="px-8 py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h3>
              <p className="text-lg text-gray-600 mb-8">Try adjusting your search or filter criteria.</p>
              <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                View All Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
