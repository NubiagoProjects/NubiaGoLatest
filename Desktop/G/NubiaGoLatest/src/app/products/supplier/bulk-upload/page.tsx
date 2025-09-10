'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Package, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import BulkProductUpload from '@/components/supplier/BulkProductUpload'

export default function SupplierBulkUploadPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'templates'>('upload')

  const tabs: Array<{ id: 'upload' | 'history' | 'templates', label: string, icon: any }> = [
    { id: 'upload', label: 'Bulk Upload', icon: Upload },
    { id: 'history', label: 'Upload History', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Package }
  ]

  const renderUploadHistory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Electronics Batch Upload</p>
                <p className="text-sm text-green-700">25 products uploaded successfully</p>
                <p className="text-xs text-green-600">2 hours ago</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-900">25/25</p>
              <p className="text-xs text-green-600">100% Success</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Accessories Upload</p>
                <p className="text-sm text-yellow-700">15 products uploaded, 2 failed validation</p>
                <p className="text-xs text-yellow-600">1 day ago</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-yellow-900">13/15</p>
              <p className="text-xs text-yellow-600">87% Success</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Clothing Collection</p>
                <p className="text-sm text-blue-700">40 products uploaded successfully</p>
                <p className="text-xs text-blue-600">3 days ago</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900">40/40</p>
              <p className="text-xs text-blue-600">100% Success</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Download Templates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Basic Product Template</h4>
                <p className="text-sm text-gray-600">Essential fields for quick uploads</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Product name, description, price</li>
              <li>• Category, stock, SKU</li>
              <li>• Basic product information</li>
            </ul>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Download CSV
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Advanced Product Template</h4>
                <p className="text-sm text-gray-600">Complete product details with SEO</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• All basic fields plus advanced options</li>
              <li>• Brand, model, UPC/EAN/ISBN</li>
              <li>• SEO optimization fields</li>
            </ul>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Download CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Template Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the provided CSV templates for best results</li>
          <li>• Ensure all required fields are filled</li>
          <li>• Use consistent formatting for dates and numbers</li>
          <li>• Separate multiple values with commas</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/products/supplier"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Product Upload</h1>
              <p className="text-gray-600 mt-2">Upload multiple products at once using CSV or Excel files</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && <BulkProductUpload />}
            {activeTab === 'history' && renderUploadHistory()}
            {activeTab === 'templates' && renderTemplates()}
          </div>
        </div>
      </div>
    </div>
  )
}
