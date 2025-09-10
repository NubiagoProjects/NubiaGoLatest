'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react'

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Suspended</h2>
          <p className="text-gray-600 mb-8">
            Your account has been suspended. Please contact our support team to resolve this issue.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Why was my account suspended?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Violation of our Terms of Service</li>
                <li>• Suspicious activity detected</li>
                <li>• Multiple failed login attempts</li>
                <li>• Payment issues</li>
                <li>• Other policy violations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Support</h3>
              
              <div className="space-y-3">
                <Link
                  href="mailto:support@nubiago.com"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Link>

                <Link
                  href="tel:+1234567890"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">What to include in your support request:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your account email address</li>
                <li>• Date when you noticed the suspension</li>
                <li>• Any relevant transaction IDs</li>
                <li>• Description of what you were doing</li>
                <li>• Any error messages you received</li>
              </ul>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
