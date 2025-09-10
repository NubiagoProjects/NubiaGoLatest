'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useLogistics } from '@/hooks/useLogistics'
import { toast } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  orderDate: string
  estimatedDelivery: string
  customer: {
    name: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
  }
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  trackingNumber: string
  shippingMethod: string
  carrierCode?: string
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const { trackingInfo, loading: trackingLoading, error: trackingError, getTrackingInfo, clearTrackingInfo } = useLogistics()
  
  // Static order data for demo
  const order: Order = {
    id: orderId,
    orderNumber: `ORD-${orderId}-2024`,
    status: 'shipped',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-20',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      }
    },
    items: [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        price: 89.99,
        quantity: 1,
        image: '/category-api-5.jpg'
      },
      {
        id: 2,
        name: 'Premium Cotton T-Shirt',
        price: 24.99,
        quantity: 2,
        image: '/product-api-3.jpg'
      }
    ],
    subtotal: 139.97,
    shipping: 9.99,
    tax: 11.20,
    total: 161.16,
    trackingNumber: 'TRK123456789',
    shippingMethod: 'Standard Shipping',
    carrierCode: 'fedex'
  }

  // Load tracking information when component mounts
  useEffect(() => {
    if (order.trackingNumber && order.carrierCode) {
      getTrackingInfo(order.trackingNumber, order.carrierCode)
    }
  }, [order.trackingNumber, order.carrierCode, getTrackingInfo])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'shipped':
        return <Truck className="h-6 w-6 text-blue-600" />
      case 'processing':
        return <Package className="h-6 w-6 text-yellow-600" />
      default:
        return <Clock className="h-6 w-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Static order data - no loading states needed for static export

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex items-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${item.price}</p>
                        <p className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.customer.name}</p>
                      <p>{order.customer.address.street}</p>
                      <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zip}</p>
                      <p>{order.customer.address.country}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Details</h4>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Method:</span> {order.shippingMethod}</p>
                      <p><span className="font-medium">Tracking:</span> {order.trackingNumber}</p>
                      <p><span className="font-medium">Estimated Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
              </div>
              <div className="px-6 py-4">
                {trackingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading tracking information...</span>
                  </div>
                ) : trackingError ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="ml-2 text-red-800">{trackingError}</span>
                    </div>
                  </div>
                ) : trackingInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{trackingInfo.status}</h4>
                        <p className="text-sm text-gray-500">
                          Tracking: {order.trackingNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {trackingInfo.estimatedDelivery ? 
                            new Date(trackingInfo.estimatedDelivery).toLocaleDateString() : 
                            'TBD'
                          }
                        </p>
                        <p className="text-xs text-gray-500">Estimated Delivery</p>
                      </div>
                    </div>
                    
                    {trackingInfo.events && trackingInfo.events.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Tracking History</h5>
                        <div className="space-y-3">
                          {trackingInfo.events.map((event, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{event.status}</p>
                                <p className="text-sm text-gray-500">{event.description}</p>
                                <p className="text-xs text-gray-400">
                                  {event.location} • {new Date(event.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No tracking information available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${order.shipping}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${order.tax}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">${order.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="text-gray-900">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-gray-900">Credit Card</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <Link
                    href={`/order/track/${order.id}`}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Link>
                  <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 