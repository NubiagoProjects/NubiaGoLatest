'use client'

import Link from 'next/link'
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle } from 'lucide-react'

export default function ShippingPage() {
  const shippingOptions = [
    {
      name: 'Standard Shipping',
      time: '3-5 business days',
      cost: '$15',
      description: 'Reliable shipping with tracking',
      features: ['Order tracking', 'Email updates', 'Signature required']
    },
    {
      name: 'Express Shipping',
      time: '1-2 business days',
      cost: '$35',
      description: 'Fast delivery for urgent orders',
      features: ['Priority handling', 'Real-time tracking', 'Guaranteed delivery']
    },
    {
      name: 'Free Shipping',
      time: '5-7 business days',
      cost: 'Free',
      description: 'Available on orders over $50',
      features: ['No minimum order', 'Standard tracking', 'Reliable delivery']
    }
  ]

  const deliveryAreas = [
    {
      region: 'Lagos',
      time: '1-2 days',
      cost: '$10',
      status: 'Available'
    },
    {
      region: 'Abuja',
      time: '2-3 days',
      cost: '$15',
      status: 'Available'
    },
    {
      region: 'Port Harcourt',
      time: '2-3 days',
      cost: '$15',
      status: 'Available'
    },
    {
      region: 'Kano',
      time: '3-4 days',
      cost: '$20',
      status: 'Available'
    },
    {
      region: 'Other Cities',
      time: '3-5 days',
      cost: '$25',
      status: 'Available'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Shipping Information
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fast, reliable shipping across Nigeria. Track your orders and get updates every step of the way.
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Shipping Options
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {option.name}
                  </h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {option.cost}
                  </div>
                  <div className="flex items-center justify-center text-gray-600 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {option.time}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 text-center">
                  {option.description}
                </p>
                <ul className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Areas */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Delivery Areas & Times
          </h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryAreas.map((area, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {area.region}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {area.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {area.cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {area.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Information */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Order Tracking
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Track Your Order
              </h3>
              <p className="text-gray-600 mb-4">
                Enter your order number or tracking ID to get real-time updates on your delivery.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Order number or tracking ID"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Track
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Updates
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Email notifications at each step
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  SMS alerts for delivery status
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time tracking on our website
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Contact information for delivery issues
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Policies */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Shipping Policies
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Processing Time
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Orders processed within 24 hours</li>
                <li>• Weekend orders processed Monday</li>
                <li>• Custom items may take 3-5 days</li>
                <li>• Holiday delays may apply</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                                      <li>• Signature required for orders over $25</li>
                <li>• Delivery attempts made during business hours</li>
                <li>• Contact us if you miss delivery</li>
                <li>• Pickup available at select locations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions About Shipping?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our customer service team is here to help with any shipping questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link 
              href="/help"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Shipping FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
