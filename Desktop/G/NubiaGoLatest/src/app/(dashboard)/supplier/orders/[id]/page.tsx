'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle, Loader2, Download, MessageSquare, Edit, User, MapPin, CreditCard } from 'lucide-react'
import ModernDashboardLayout from '@/components/dashboard/ModernDashboardLayout'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  sku: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  estimatedDelivery: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  trackingNumber?: string
  shippingMethod: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  paymentMethod: string
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  billingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export default function SupplierOrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Sidebar items for supplier dashboard
  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Package,
      path: '/supplier'
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/supplier/products'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      path: '/supplier/orders'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      path: '/supplier/inventory'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Package,
      path: '/supplier/analytics'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: User,
      path: '/supplier/customers'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      path: '/supplier/payments'
    },
    {
      id: 'support',
      label: 'Support',
      icon: MessageSquare,
      path: '/supplier/support'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Package,
      path: '/supplier/settings'
    }
  ]

  useEffect(() => {
    // Simulate loading order data
    const loadOrder = async () => {
      setLoading(true)
      
      // Mock order data - in real app, fetch from API
      const mockOrder: Order = {
        id: orderId,
        orderNumber: `ORD-${orderId.toUpperCase()}`,
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+1 (555) 123-4567',
        status: 'processing',
        orderDate: '2024-01-15T10:30:00Z',
        estimatedDelivery: '2024-01-20T17:00:00Z',
        items: [
          {
            id: '1',
            name: 'Wireless Bluetooth Headphones',
            price: 89.99,
            quantity: 1,
            image: '/category-api-5.jpg',
            sku: 'WBH-001'
          },
          {
            id: '2',
            name: 'Premium Cotton T-Shirt',
            price: 24.99,
            quantity: 2,
            image: '/product-api-3.jpg',
            sku: 'PCT-002'
          }
        ],
        subtotal: 139.97,
        shipping: 9.99,
        tax: 11.20,
        total: 161.16,
        trackingNumber: 'TRK123456789',
        shippingMethod: 'Standard Shipping',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card ending in 4242',
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        billingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrder(mockOrder)
      setLoading(false)
    }

    loadOrder()
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusUpdate = (newStatus: string) => {
    if (order) {
      setOrder({ ...order, status: newStatus as any })
      // In real app, make API call to update status
      // TODO: Replace with toast notification
      console.log(`Updating order ${order.id} status to ${newStatus}`)
    }
  }

  if (loading) {
    return (
      <ModernDashboardLayout
        title="Order Details"
        subtitle="Loading order information..."
        sidebarItems={sidebarItems}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading order details...</span>
        </div>
      </ModernDashboardLayout>
    )
  }

  if (!order) {
    return (
      <ModernDashboardLayout
        title="Order Not Found"
        subtitle="The requested order could not be found"
        sidebarItems={sidebarItems}
      >
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/supplier/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout
      title="Order Management"
      subtitle={`Order ${order.orderNumber}`}
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/supplier/orders"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium">{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                      <p>{order.customerPhone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Method:</span> {order.shippingMethod}</p>
                      {order.trackingNumber && (
                        <p><span className="font-medium">Tracking:</span> {order.trackingNumber}</p>
                      )}
                      <p>
                        <span className="font-medium">Estimated Delivery:</span>{' '}
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-base font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="text-gray-900 font-mono">{order.orderNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <button className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </button>
                  <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </button>
                  <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
