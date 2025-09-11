'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  MapPin, Calendar, Phone, Mail
} from 'lucide-react'

interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  timestamp: string
  isCompleted: boolean
}

interface TrackingInfo {
  orderId: string
  trackingNumber: string
  status: string
  estimatedDelivery: string
  carrier: string
  events: TrackingEvent[]
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading tracking data
    setTimeout(() => {
      if (orderId) {
        setTrackingInfo({
          orderId: orderId,
          trackingNumber: `TRK${orderId.replace('ORD-', '')}789`,
          status: 'shipped',
          estimatedDelivery: '2024-01-25',
          carrier: 'NubiaGo Express',
          events: [
            {
              id: '1',
              status: 'order_placed',
              description: 'Order placed successfully',
              location: 'Istanbul, Turkey',
              timestamp: '2024-01-20T10:00:00Z',
              isCompleted: true
            },
            {
              id: '2',
              status: 'processing',
              description: 'Order is being prepared',
              location: 'Istanbul Warehouse',
              timestamp: '2024-01-20T14:30:00Z',
              isCompleted: true
            },
            {
              id: '3',
              status: 'shipped',
              description: 'Package shipped and on its way',
              location: 'Istanbul Distribution Center',
              timestamp: '2024-01-21T09:15:00Z',
              isCompleted: true
            },
            {
              id: '4',
              status: 'in_transit',
              description: 'Package in transit',
              location: 'Ankara Hub',
              timestamp: '2024-01-22T16:45:00Z',
              isCompleted: false
            },
            {
              id: '5',
              status: 'out_for_delivery',
              description: 'Out for delivery',
              location: 'Local Delivery Center',
              timestamp: '',
              isCompleted: false
            },
            {
              id: '6',
              status: 'delivered',
              description: 'Package delivered',
              location: 'Delivery Address',
              timestamp: '',
              isCompleted: false
            }
          ]
        })
      } else {
        setError('Order ID not found')
      }
      setLoading(false)
    }, 1000)
  }, [orderId])

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    
    switch (status) {
      case 'shipped':
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'out_for_delivery':
        return <Package className="h-5 w-5 text-orange-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking Information Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load tracking information'}</p>
          <Link
            href="/customer/orders"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/customer/orders" className="text-gray-400 hover:text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
              <p className="text-gray-600">Order #{trackingInfo.orderId}</p>
            </div>
          </div>
        </div>

        {/* Tracking Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tracking Number</h3>
              <p className="text-lg font-semibold text-gray-900">{trackingInfo.trackingNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <p className="text-lg font-semibold text-blue-600 capitalize">
                {trackingInfo.status.replace('_', ' ')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h2>
          <div className="space-y-6">
            {trackingInfo.events.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(event.status, event.isCompleted)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      event.isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {event.description}
                    </p>
                    {event.timestamp && (
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrier Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Carrier Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Carrier</h3>
              <p className="text-gray-900">{trackingInfo.carrier}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">+90 212 123 4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">support@nubiago.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
