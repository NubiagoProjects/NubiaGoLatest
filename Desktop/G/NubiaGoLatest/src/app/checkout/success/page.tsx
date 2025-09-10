'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircleIcon, ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { PaymentStatus } from '@/components/payment/payment-status'
import { usePaymentStore } from '@/store/payment'
import { CartService } from '@/lib/services/cart.service'
import { useAuth } from '@/hooks/useAuth'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { clearPayment } = usePaymentStore()
  const cartService = new CartService()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    const paymentIdParam = searchParams.get('paymentId')
    
    if (orderIdParam) setOrderId(orderIdParam)
    if (paymentIdParam) setPaymentId(paymentIdParam)

    // Clear cart and payment data on successful payment
    const clearCartData = async () => {
      if (user?.uid) {
        await cartService.clearCart(user.uid)
      }
      clearPayment()
    }
    
    clearCartData()
  }, [searchParams, user?.uid, clearPayment])

  const handleContinueShopping = () => {
    router.push('/products')
  }

  const handleViewOrders = () => {
    router.push('/customer/orders')
  }

  if (!paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleContinueShopping} 
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Continue Shopping
            </button>
            <button 
              onClick={handleViewOrders} 
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-md font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            <PaymentStatus 
              paymentId={paymentId} 
              onStatusChange={(status) => {
                if (status === 'completed') {
                  // Payment is confirmed
                }
              }}
            />
          </div>

          {/* Order Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {orderId && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Order ID</h3>
                  <p className="font-mono text-lg text-gray-900">{orderId}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Payment ID</h3>
                <p className="font-mono text-lg text-gray-900">{paymentId}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">What's Next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">You'll receive an email confirmation shortly</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Your order will be processed within 24 hours</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">You can track your order in your dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleContinueShopping} 
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>Continue Shopping</span>
                </button>
                <button 
                  onClick={handleViewOrders} 
                  className="w-full bg-white text-gray-700 py-3 px-6 rounded-md font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                  <span>View Orders</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Support</h4>
              <p className="text-sm text-gray-600">
                Questions about your order? Contact our support team for assistance.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Information</h4>
              <p className="text-sm text-gray-600">
                Standard delivery takes 3-5 business days. You'll receive tracking updates.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Returns & Refunds</h4>
              <p className="text-sm text-gray-600">
                Not satisfied? We offer easy returns within 30 days of delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
