'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Truck, Package, Clock, CheckCircle, AlertCircle, Phone, MessageSquare } from 'lucide-react'
import { useShippingStore } from '@/store/shipping'

interface TrackingEvent {
  id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'failed'
  location: string
  timestamp: Date
  description: string
  estimatedDelivery?: Date
  actualDelivery?: Date
  courier?: {
    name: string
    phone: string
    vehicle: string
    photo?: string
  }
}

interface OrderTracking {
  orderId: string
  trackingNumber: string
  status: 'pending' | 'confirmed' | 'shipped' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'failed'
  events: TrackingEvent[]
  estimatedDelivery: Date
  currentLocation?: {
    lat: number
    lng: number
    address: string
  }
  courier?: {
    name: string
    phone: string
    vehicle: string
    photo?: string
    currentLocation?: {
      lat: number
      lng: number
    }
  }
}

export function LiveOrderTracking({ orderId }: { orderId: string }) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [isRealTime, setIsRealTime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const mapRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock tracking data
  const mockTrackingData: OrderTracking = {
    orderId,
    trackingNumber: 'NUB' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'in-transit',
    events: [
      {
        id: '1',
        status: 'confirmed',
        location: 'Lagos, Nigeria',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: 'Order confirmed and payment received',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        status: 'shipped',
        location: 'Lagos Warehouse',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        description: 'Package picked up by courier',
        courier: {
          name: 'John Doe',
          phone: '+234 801 234 5678',
          vehicle: 'Motorcycle - LAG 123 AB'
        }
      },
      {
        id: '3',
        status: 'in-transit',
        location: 'Ibadan Distribution Center',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Package in transit to destination',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        status: 'in-transit',
        location: 'Abuja Hub',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Package arrived at local hub',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      }
    ],
    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    currentLocation: {
      lat: 9.0820,
      lng: 8.6753,
      address: 'Abuja, Nigeria'
    },
    courier: {
      name: 'John Doe',
      phone: '+234 801 234 5678',
      vehicle: 'Motorcycle - LAG 123 AB',
      currentLocation: {
        lat: 9.0820,
        lng: 8.6753
      }
    }
  }

  // Load tracking data
  useEffect(() => {
    const loadTrackingData = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setTracking(mockTrackingData)
        setError(null)
      } catch (err) {
        setError('Failed to load tracking information')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrackingData()
  }, [orderId])

  // Real-time updates
  useEffect(() => {
    if (!isRealTime || !tracking) return

    const updateTracking = () => {
      setTracking(prev => {
        if (!prev) return prev

        // Simulate real-time updates
        const newEvents = [...prev.events]
        const random = Math.random()

        if (random > 0.95) {
          // New event
          const newEvent: TrackingEvent = {
            id: Date.now().toString(),
            status: 'in-transit',
            location: 'En route to destination',
            timestamp: new Date(),
            description: 'Package is on the move',
            estimatedDelivery: prev.estimatedDelivery
          }
          newEvents.push(newEvent)
        }

        // Update current location
        const currentLocation = {
          lat: prev.currentLocation?.lat || 9.0820 + (Math.random() - 0.5) * 0.01,
          lng: prev.currentLocation?.lng || 8.6753 + (Math.random() - 0.5) * 0.01,
          address: 'En route to destination'
        }

        return {
          ...prev,
          events: newEvents,
          currentLocation,
          courier: prev.courier ? {
            ...prev.courier,
            currentLocation: {
              lat: currentLocation.lat,
              lng: currentLocation.lng
            }
          } : undefined
        }
      })

      setLastUpdate(new Date())
    }

    intervalRef.current = setInterval(updateTracking, 30000) // Update every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRealTime, tracking])

  // Initialize map
  useEffect(() => {
    if (showMap && mapRef.current && tracking?.currentLocation) {
      // In a real app, this would initialize Google Maps or similar
      console.log('Initializing map with location:', tracking.currentLocation)
    }
  }, [showMap, tracking])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'in-transit':
      case 'out-for-delivery':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'in-transit':
      case 'out-for-delivery':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'shipped':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !tracking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Error</h3>
          <p className="text-gray-600">{error || 'Unable to load tracking information'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Order #{tracking.orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tracking Number</p>
            <p className="font-mono text-lg font-semibold">{tracking.trackingNumber}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tracking.status)}`}>
          {getStatusIcon(tracking.status)}
          <span className="ml-2 capitalize">{tracking.status.replace('-', ' ')}</span>
        </div>

        {/* Estimated Delivery */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Estimated Delivery</p>
              <p className="text-lg font-semibold text-blue-900">
                {tracking.estimatedDelivery.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Last Updated</p>
              <p className="text-sm text-blue-900">
                {lastUpdate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRealTime}
                onChange={(e) => setIsRealTime(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Real-time updates</span>
            </label>
            {isRealTime && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Location</h3>
          <div
            ref={mapRef}
            className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Map integration would be here</p>
              <p className="text-sm text-gray-500 mt-1">
                Current location: {tracking.currentLocation?.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Courier Information */}
      {tracking.courier && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Courier Information</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">{tracking.courier.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{tracking.courier.name}</p>
              <p className="text-sm text-gray-600">{tracking.courier.vehicle}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
        <div className="space-y-6">
          {tracking.events.map((event, index) => (
            <div key={event.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  index === tracking.events.length - 1
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-200 border-gray-300'
                }`}></div>
                {index < tracking.events.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{event.location}</h4>
                  <span className="text-sm text-gray-500">
                    {event.timestamp.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{event.description}</p>
                {event.courier && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Courier:</span> {event.courier.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Vehicle:</span> {event.courier.vehicle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
