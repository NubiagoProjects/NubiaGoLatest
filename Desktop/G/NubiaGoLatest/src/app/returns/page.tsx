'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Go to your order history and select the item you want to return',
      icon: Package
    },
    {
      step: 2,
      title: 'Select Reason',
      description: 'Choose the reason for your return from our predefined options',
      icon: CheckCircle
    },
    {
      step: 3,
      title: 'Print Label',
      description: 'Download and print the return shipping label provided',
      icon: Package
    },
    {
      step: 4,
      title: 'Ship Item',
      description: 'Package your item securely and drop it off at any shipping location',
      icon: Package
    },
    {
      step: 5,
      title: 'Track Refund',
      description: 'Monitor your return status and expect refund within 5-7 business days',
      icon: Clock
    }
  ]

  const returnPolicy = {
    timeLimit: '30 days from delivery',
    conditions: [
      'Item must be in original condition',
      'All original packaging and tags included',
      'No signs of wear or damage',
      'Electronics must be factory reset'
    ],
    nonReturnable: [
      'Personalized or custom items',
      'Perishable goods',
      'Digital downloads',
      'Gift cards'
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Returns & Refunds
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. Our easy return process ensures a hassle-free experience.
            </p>
          </div>
        </div>
      </div>

      {/* Return Policy */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Return Policy
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Return Window
              </h3>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700">
                  {returnPolicy.timeLimit}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-3">Return Conditions:</h4>
              <ul className="space-y-2">
                {returnPolicy.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Non-Returnable Items
              </h3>
              <ul className="space-y-2">
                {returnPolicy.nonReturnable.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Return Process */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How to Return an Item
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {returnSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {step.step}
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refund Information */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Refund Information
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Time
              </h3>
              <p className="text-gray-600">
                5-7 business days after we receive your return
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Shipping Cost
              </h3>
              <p className="text-gray-600">
                Free return shipping for eligible items
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Refund Method
              </h3>
              <p className="text-gray-600">
                Refunded to original payment method
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Return */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Return?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Access your order history to begin the return process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/customer/orders"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Orders
            </Link>
            <Link 
              href="/help"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
