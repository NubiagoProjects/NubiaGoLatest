'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CheckCircle, Package, Truck, Home, ShoppingBag,
  Mail, Phone, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [orderDetails, setOrderDetails] = useState({
    total: 0,
    items: 0,
    estimatedDelivery: ''
  })

  useEffect(() => {
    // Generate a random order ID if not provided
    const id = searchParams.get('orderId') || `ORD-${Date.now()}`
    setOrderId(id)
    
    // Simulate order details
    setOrderDetails({
      total: 499.97,
      items: 3,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Order Confirmed!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Order ID</span>
              <span className="text-sm font-medium text-gray-900">{orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Amount</span>
              <span className="text-sm font-medium text-gray-900">${orderDetails.total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Items</span>
              <span className="text-sm font-medium text-gray-900">{orderDetails.items}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Estimated Delivery</span>
              <span className="text-sm font-medium text-gray-900">{orderDetails.estimatedDelivery}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Confirmation Email</p>
                <p className="text-sm text-gray-500">You'll receive a confirmation email with order details.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Order Processing</p>
                <p className="text-sm text-gray-500">Your order is being processed and will be shipped soon.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Truck className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Shipping Updates</p>
                <p className="text-sm text-gray-500">You'll receive tracking information once your order ships.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/customer"
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          <Link
            href="/products"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-500">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 
