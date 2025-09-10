'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Store, Clock, AlertTriangle, CheckCircle, 
  User, Shield, Info, Eye
} from 'lucide-react'
import ProductFormBase, { ProductFormData, ProductFormProps } from '../base/ProductFormBase'
import { useToast } from '@/components/ui/toast'

interface SupplierProductFormData extends ProductFormData {
  supplierId: string // Auto-assigned
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt?: Date
  approvedAt?: Date
  approvedBy?: string
  commissionRate?: number
  isFeatured: boolean
  maxOrderQuantity?: number
  minOrderQuantity?: number
  leadTime?: number // Days to fulfill
  // SEO Optimization Fields
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  productHighlights?: string[]
}

interface SupplierProductFormProps extends Omit<ProductFormProps, 'mode' | 'onSubmit'> {
  initialData?: Partial<SupplierProductFormData>
  onSubmit: (data: SupplierProductFormData) => Promise<void>
  supplierId: string // Required for supplier products
}

export default function SupplierProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  supplierId
}: SupplierProductFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  
  const [supplierFormData, setSupplierFormData] = useState<SupplierProductFormData>({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    category: '',
    images: [],
    stock: 0,
    sku: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    tags: [],
    isActive: false, // Supplier products start as inactive
    requiresApproval: true, // Supplier products require approval
    supplierId: supplierId, // Auto-assigned
    approvalStatus: 'pending',
    approvalNotes: '',
    submittedAt: new Date(),
    approvedAt: undefined,
    approvedBy: undefined,
    commissionRate: 10, // Default 10% commission
    isFeatured: false,
    maxOrderQuantity: undefined,
    minOrderQuantity: 1,
    leadTime: 3, // Default 3 days
    // SEO Optimization Fields
    seoTitle: '',
    seoDescription: '',
    metaKeywords: [],
    productHighlights: [],
    ...initialData
  })

  const [showSupplierFields, setShowSupplierFields] = useState(false)
  const [showApprovalInfo, setShowApprovalInfo] = useState(false)

  // Handle supplier-specific field changes
  const handleSupplierFieldChange = (field: keyof SupplierProductFormData, value: any) => {
    setSupplierFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle form submission with supplier-specific logic
  const handleSupplierSubmit = async (baseData: ProductFormData) => {
    try {
      const combinedData: SupplierProductFormData = {
        ...baseData,
        ...supplierFormData,
        // Supplier-specific overrides
        isActive: false, // Always start as inactive for suppliers
        requiresApproval: true, // Always require approval
        supplierId: supplierId, // Auto-assigned
        approvalStatus: 'pending',
        submittedAt: new Date(),
        commissionRate: supplierFormData.commissionRate || 10,
        isFeatured: supplierFormData.isFeatured,
        maxOrderQuantity: supplierFormData.maxOrderQuantity,
        minOrderQuantity: supplierFormData.minOrderQuantity || 1,
        leadTime: supplierFormData.leadTime || 3
      }

      await onSubmit(combinedData)
      success('Product submitted for approval successfully!')
      router.push('/products/supplier')
    } catch (err) {
      error('Failed to submit product for approval')
      throw err
    }
  }

  return (
    <div className="space-y-6">
      {/* Supplier-specific header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-blue-100 mt-1">Submit a new product for admin approval</p>
          </div>
          <div className="flex items-center space-x-2">
            <Store className="h-6 w-6" />
            <span className="text-sm font-medium">Supplier Mode</span>
          </div>
        </div>
      </div>

      {/* Approval Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Approval Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your product will be reviewed by our admin team before being published. 
              This process typically takes 1-3 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Base Product Form */}
      <ProductFormBase
        mode="supplier"
        initialData={supplierFormData}
        onSubmit={handleSupplierSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />

      {/* Supplier-specific Fields */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setShowSupplierFields(!showSupplierFields)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <Store className="h-5 w-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Supplier Settings</h3>
            </div>
            <span className="text-sm text-gray-500">
              {showSupplierFields ? 'Hide' : 'Show'} supplier options
            </span>
          </button>
        </div>

        {showSupplierFields && (
          <div className="p-6 space-y-6">
            {/* Commission & Pricing */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Commission & Pricing
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={supplierFormData.commissionRate}
                    onChange={(e) => handleSupplierFieldChange('commissionRate', parseFloat(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="10"
                    min="0"
                    max="50"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard commission rate for your products
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={supplierFormData.isFeatured}
                    onChange={(e) => handleSupplierFieldChange('isFeatured', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                    Request Featured Placement
                  </label>
                </div>
              </div>
            </div>

            {/* Order Management */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Order Management
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    value={supplierFormData.minOrderQuantity}
                    onChange={(e) => handleSupplierFieldChange('minOrderQuantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Order Quantity
                  </label>
                  <input
                    type="number"
                    value={supplierFormData.maxOrderQuantity || ''}
                    onChange={(e) => handleSupplierFieldChange('maxOrderQuantity', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="No limit"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={supplierFormData.leadTime}
                    onChange={(e) => handleSupplierFieldChange('leadTime', parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="3"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            </div>

            {/* Approval Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Approval Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Notes (Optional)
                    </label>
                    <textarea
                      value={supplierFormData.approvalNotes}
                      onChange={(e) => handleSupplierFieldChange('approvalNotes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any additional notes for the admin team..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Supplier ID:</span>
                      <span className="text-sm font-medium text-gray-900">{supplierId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Commission:</span>
                      <span className="text-sm font-medium text-gray-900">{supplierFormData.commissionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-blue-900 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Submission Guidelines
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Ensure all product information is accurate and complete
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  High-quality images are required for approval
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Pricing should be competitive and include commission
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Lead time should reflect actual fulfillment capability
                </li>
              </ul>
            </div>

            {/* SEO Optimization */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                SEO Optimization
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.seoTitle || ''}
                    onChange={(e) => handleSupplierFieldChange('seoTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter SEO-optimized title (max 60 characters)"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {supplierFormData.seoTitle?.length || 0}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={supplierFormData.seoDescription || ''}
                    onChange={(e) => handleSupplierFieldChange('seoDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter SEO-optimized description (max 160 characters)"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {supplierFormData.seoDescription?.length || 0}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add keyword"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.target as HTMLInputElement
                            if (input.value.trim()) {
                              handleSupplierFieldChange('metaKeywords', [...(supplierFormData.metaKeywords || []), input.value.trim()])
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                    {supplierFormData.metaKeywords && supplierFormData.metaKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {supplierFormData.metaKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => handleSupplierFieldChange('metaKeywords', supplierFormData.metaKeywords?.filter((_, i) => i !== index) || [])}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Highlights
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add product highlight"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.target as HTMLInputElement
                            if (input.value.trim()) {
                              handleSupplierFieldChange('productHighlights', [...(supplierFormData.productHighlights || []), input.value.trim()])
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                    {supplierFormData.productHighlights && supplierFormData.productHighlights.length > 0 && (
                      <div className="space-y-2">
                        {supplierFormData.productHighlights.map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-blue-600">•</span>
                            <span className="flex-1 text-sm text-gray-700">{highlight}</span>
                            <button
                              type="button"
                              onClick={() => handleSupplierFieldChange('productHighlights', supplierFormData.productHighlights?.filter((_, i) => i !== index) || [])}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Status Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Pending Approval</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Supplier Product</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Admin Review Required</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Process Info */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setShowApprovalInfo(!showApprovalInfo)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Approval Process</h3>
            </div>
            <span className="text-sm text-gray-500">
              {showApprovalInfo ? 'Hide' : 'Show'} process details
            </span>
          </button>
        </div>

        {showApprovalInfo && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Submit</h4>
                <p className="text-sm text-gray-600">Submit your product for review</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Review</h4>
                <p className="text-sm text-gray-600">Admin team reviews your product</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Publish</h4>
                <p className="text-sm text-gray-600">Product goes live on marketplace</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You'll receive an email confirmation of submission</li>
                <li>• Our admin team will review within 1-3 business days</li>
                <li>• You'll be notified of approval or any required changes</li>
                <li>• Approved products will be published to the marketplace</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
