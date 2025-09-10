'use client'

import { useState, useEffect } from 'react'
import { useShippingStore } from '@/store/shipping'
import { Input } from '@/components/ui/form'
import { toast } from '@/components/ui/toast'
import { 
  Truck, Package, MapPin, Clock, CheckCircle, XCircle,
  RefreshCw, Search, ExternalLink
} from 'lucide-react'

interface TrackingWidgetProps {
  trackingNumber?: string
  carrierCode?: string
  className?: string
}

export function TrackingWidget({ 
  trackingNumber: initialTrackingNumber, 
  carrierCode: initialCarrierCode,
  className = '' 
}: TrackingWidgetProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  const [carrierCode, setCarrierCode] = useState(initialCarrierCode || '')
  const [isSearching, setIsSearching] = useState(false)

  const {
    trackingInfo,
    trackingLoading,
    trackingError,
    getTrackingInfo,
    clearTrackingInfo,
  } = useShippingStore()

  useEffect(() => {
    if (initialTrackingNumber && initialCarrierCode) {
      handleTrack()
    }
  }, [initialTrackingNumber, initialCarrierCode])

  const handleTrack = async () => {
    if (!trackingNumber || !carrierCode) {
      toast.error('Please enter both tracking number and carrier')
      return
    }

    setIsSearching(true)
    const success = await getTrackingInfo(trackingNumber, carrierCode)
    
    if (success) {
      toast.success('Tracking information updated')
    } else {
      toast.error(trackingError || 'Failed to get tracking information')
    }
    
    setIsSearching(false)
  }

  const handleRefresh = () => {
    if (trackingNumber && carrierCode) {
      handleTrack()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'in_transit':
      case 'in transit':
        return 'text-blue-600 bg-blue-100'
      case 'out_for_delivery':
      case 'out for delivery':
        return 'text-orange-600 bg-orange-100'
      case 'shipped':
        return 'text-purple-600 bg-purple-100'
      case 'failed':
      case 'exception':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'in_transit':
      case 'in transit':
        return <Truck className="h-4 w-4" />
      case 'out_for_delivery':
      case 'out for delivery':
        return <Package className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'failed':
      case 'exception':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getCarrierTrackingUrl = (trackingNumber: string, carrierCode: string) => {
    const carrierUrls: Record<string, string> = {
      'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      'bagster': `https://www.bagster.com/track/${trackingNumber}`,
    }
    
    return carrierUrls[carrierCode.toLowerCase()] || '#'
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Truck className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-medium text-gray-900">Track Your Package</h2>
      </div>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number
            </label>
            <Input
              value={trackingNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier
            </label>
            <select
              value={carrierCode}
              onChange={(e) => setCarrierCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select carrier</option>
              <option value="usps">USPS</option>
              <option value="fedex">FedEx</option>
              <option value="ups">UPS</option>
              <option value="dhl">DHL</option>
              <option value="bagster">Bagster</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleTrack}
            disabled={trackingLoading || isSearching || !trackingNumber || !carrierCode}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {trackingLoading || isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Tracking...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Track Package</span>
              </div>
            )}
          </button>
          {trackingInfo && (
            <button
              onClick={handleRefresh}
              disabled={trackingLoading}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${trackingLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {trackingError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800 text-sm">{trackingError}</p>
        </div>
      )}

      {/* Tracking Information */}
      {trackingInfo && (
        <div className="space-y-6">
          {/* Status Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(trackingInfo.status)}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {trackingInfo.status.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tracking: {trackingInfo.trackingNumber}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trackingInfo.status)}`}>
                {trackingInfo.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Delivery Information */}
          {trackingInfo.estimatedDelivery && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Estimated Delivery:</span>{' '}
                  {formatDate(trackingInfo.estimatedDelivery)}
                </p>
              </div>
            </div>
          )}

          {/* Tracking Events */}
          {trackingInfo.events && trackingInfo.events.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
              <div className="space-y-4">
                {trackingInfo.events.map((event, index) => (
                  <div key={index} className="relative">
                    {index !== trackingInfo.events.length - 1 && (
                      <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {event.status}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {event.location} • {formatDate(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Tracking Link */}
          <div className="border-t border-gray-200 pt-4">
            <a
              href={getCarrierTrackingUrl(trackingInfo.trackingNumber, carrierCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              <span>Track on carrier website</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* No Results */}
      {!trackingInfo && !trackingLoading && !trackingError && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Enter a tracking number and carrier to track your package
          </p>
        </div>
      )}
    </div>
  )
} 
