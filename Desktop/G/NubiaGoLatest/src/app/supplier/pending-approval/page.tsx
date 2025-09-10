'use client'

import Link from 'next/link'
import { Clock, CheckCircle, AlertCircle, Mail, Phone, ArrowLeft } from 'lucide-react'

export default function SupplierPendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pending Approval</h2>
          <p className="text-gray-600 mb-8">
            Your supplier account is currently under review. We'll notify you once it's approved.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Application Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                    <p className="text-sm text-gray-500">Your supplier application has been received</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Under Review</p>
                    <p className="text-sm text-gray-500">Our team is reviewing your application</p>
                  </div>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-sm text-gray-400">You'll be notified when approved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our admin team reviews your business documents</li>
                <li>• We verify your business information</li>
                <li>• Background checks are performed</li>
                <li>• You'll receive an email notification of the decision</li>
                <li>• Approval typically takes 1-3 business days</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Need help?</h3>
              
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
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Frequently Asked Questions</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Q:</strong> How long does approval take?</p>
                <p><strong>A:</strong> Typically 1-3 business days, depending on application volume.</p>
                
                <p><strong>Q:</strong> Can I check my application status?</p>
                <p><strong>A:</strong> You'll receive email updates at each stage of the process.</p>
                
                <p><strong>Q:</strong> What if my application is rejected?</p>
                <p><strong>A:</strong> We'll provide detailed feedback and you can reapply after 30 days.</p>
              </div>
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
