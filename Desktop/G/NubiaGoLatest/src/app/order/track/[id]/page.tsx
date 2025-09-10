import React from 'react'
import { 
  Truck, Package, MapPin, Clock, CheckCircle, XCircle,
  Home, ShoppingBag, ArrowLeft, Phone, Mail
} from 'lucide-react'
import Link from 'next/link'

// Required for static export
export async function generateStaticParams() {
  return [
    { id: 'sample-order-1' },
    { id: 'sample-order-2' },
    { id: 'sample-order-3' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' }
  ]
}

interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  timestamp: string
  completed: boolean
}

interface OrderDetails {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  estimatedDelivery: string
  actualDelivery?: string
  trackingNumber?: string
  carrier: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  events: TrackingEvent[]
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  
  // Static order details for demo
  const orderDetails: OrderDetails = {
    id: orderId,
    status: 'shipped',
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 99.99 },
      { name: 'Smart Watch', quantity: 2, price: 199.99 }
    ],
    total: 499.97,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    trackingNumber: 'TRK123456789',
    carrier: 'usps',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    events: [
      {
        id: '1',
        status: 'Order Placed',
        description: 'Your order has been placed successfully',
        location: 'Online Store',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        id: '2',
        status: 'Order Confirmed',
        description: 'Your order has been confirmed and is being processed',
        location: 'Warehouse',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        id: '3',
        status: 'Processing',
        description: 'Your order is being prepared for shipment',
        location: 'Warehouse',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        id: '4',
        status: 'Shipped',
        description: 'Your order has been shipped',
        location: 'Shipping Center',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        id: '5',
        status: 'In Transit',
        description: 'Your order is on its way to you',
        location: 'In Transit',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        id: '6',
        status: 'Out for Delivery',
        description: 'Your order is out for delivery',
        location: 'Local Delivery',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        completed: false
      },
      {
        id: '7',
        status: 'Delivered',
        description: 'Your order has been delivered',
        location: 'Your Address',
        timestamp: '',
        completed: false
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'shipped': return 'text-blue-600 bg-blue-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/customer" className="text-gray-400 hover:text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600">Order #{orderDetails.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Tracking Timeline</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                  {orderDetails.status}
                </span>
              </div>

              <div className="space-y-6">
                {orderDetails.events.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      event.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {event.completed ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <Clock className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.status}</p>
                        <p className="text-xs text-gray-500">{event.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order ID</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tracking Number</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Carrier</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Estimated Delivery</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">{orderDetails.shippingAddress.street}</p>
                <p className="text-sm text-gray-900">
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-900">{orderDetails.shippingAddress.country}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-sm font-medium text-gray-900">${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 