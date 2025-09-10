import React from 'react'
import { CheckCircleIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { 
  CheckCircle, Package, Truck, Home, ShoppingBag,
  Mail, Phone, ArrowRight, Download, Share2, MapPin,
  Calendar, Clock, DollarSign
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



interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface OrderDetails {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  createdAt: string
  estimatedDelivery: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  transactionId: string
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  
  // Static order details for demo
  const orderDetails = {
    id: orderId,
    status: 'confirmed' as const,
    items: [
      {
        id: 'PROD-001',
        name: 'Wireless Headphones',
        price: 99.99,
        quantity: 1,
        image: '/category-api-5.jpg'
      },
      {
        id: 'PROD-002',
        name: 'Smart Watch',
        price: 199.99,
        quantity: 2,
        image: '/product-order-2.jpg'
      }
    ],
    subtotal: 499.97,
    shipping: 9.99,
    tax: 39.99,
    total: 549.95,
    createdAt: new Date().toLocaleDateString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'Mobile Money',
    transactionId: `TXN-${Date.now()}`
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shipping Address</p>
                    <p className="text-sm text-gray-600">
                      {orderDetails.shippingAddress.street}<br />
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}<br />
                      {orderDetails.shippingAddress.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">{orderDetails.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Transaction ID</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.transactionId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Order Date</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Order ID</span>
                  <span className="text-sm font-medium text-gray-900">{orderDetails.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {orderDetails.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Amount</span>
                  <span className="text-sm font-medium text-gray-900">${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/order/track/${orderDetails.id}`}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Track Order
                </Link>
                <div className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </div>
                <div className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Order
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Confirmation Email</p>
                    <p className="text-xs text-gray-500">Check your email for order details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Processing</p>
                    <p className="text-xs text-gray-500">We'll start preparing your order</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shipping Updates</p>
                    <p className="text-xs text-gray-500">Track your order in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/customer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 