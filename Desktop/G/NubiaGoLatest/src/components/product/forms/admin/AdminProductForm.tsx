'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Settings, Shield, Globe, 
  CheckCircle, AlertCircle, Clock
} from 'lucide-react'
import ProductFormBase, { ProductFormData, ProductFormProps } from '../base/ProductFormBase'
import { useToast } from '@/components/ui/toast'
import { useFormAutoSave } from '@/hooks/useFormAutoSave'

interface AdminProductFormData extends ProductFormData {
  id?: string
  supplierId?: string
  featured: boolean
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  taxRate?: number
  shippingWeight?: number
  isDigital: boolean
  downloadUrl?: string
  variants?: Array<{
    id: string
    name: string
    sku: string
    price: number
    stock: number
  }>
}

interface AdminProductFormProps extends Omit<ProductFormProps, 'mode' | 'onSubmit'> {
  initialData?: Partial<AdminProductFormData>
  onSubmit: (data: AdminProductFormData) => Promise<void>
}

export default function AdminProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: AdminProductFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  
  const defaultFormData: AdminProductFormData = {
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
    isActive: true, // Admin can publish directly
    requiresApproval: false, // Admin products don't need approval
    supplierId: '',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    metaKeywords: [],
    taxRate: 0,
    shippingWeight: 0,
    isDigital: false,
    downloadUrl: '',
    variants: [],
    ...initialData
  }

  const { data: adminFormData, updateData: setAdminFormData, isSaving, hasUnsavedChanges, forceSave } = useFormAutoSave({
    initialData: defaultFormData,
    onSave: async (data) => {
      if (initialData?.id) {
        await onSubmit(data)
      }
    },
    storageKey: initialData?.id ? `product-draft-${initialData.id}` : undefined,
    enabled: !!initialData?.id
  })

  const [showAdvancedFields, setShowAdvancedFields] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')

  // Handle admin-specific field changes
  const handleAdminFieldChange = useCallback((field: keyof AdminProductFormData, value: any) => {
    setAdminFormData({ [field]: value })
  }, [setAdminFormData])

  // Add SEO keyword
  const handleAddKeyword = useCallback(() => {
    if (newKeyword.trim() && !adminFormData.metaKeywords?.includes(newKeyword.trim())) {
      setAdminFormData({
        metaKeywords: [...(adminFormData.metaKeywords || []), newKeyword.trim()]
      })
      setNewKeyword('')
    }
  }, [newKeyword, adminFormData.metaKeywords, setAdminFormData])

  // Remove SEO keyword
  const handleRemoveKeyword = useCallback((keywordToRemove: string) => {
    setAdminFormData({
      metaKeywords: adminFormData.metaKeywords?.filter(keyword => keyword !== keywordToRemove) || []
    })
  }, [adminFormData.metaKeywords, setAdminFormData])

  // Handle form submission with admin-specific logic
  const handleAdminSubmit = useCallback(async (baseData: ProductFormData) => {
    try {
      const combinedData: AdminProductFormData = {
        ...baseData,
        ...adminFormData,
        // Admin-specific overrides
        isActive: adminFormData.isActive,
        requiresApproval: false,
        supplierId: adminFormData.supplierId || 'admin',
        featured: adminFormData.featured,
        seoTitle: adminFormData.seoTitle || baseData.name,
        seoDescription: adminFormData.seoDescription || baseData.description.substring(0, 160),
        metaKeywords: adminFormData.metaKeywords || [],
        taxRate: adminFormData.taxRate || 0,
        shippingWeight: adminFormData.shippingWeight || 0,
        isDigital: adminFormData.isDigital,
        downloadUrl: adminFormData.downloadUrl || '',
        variants: adminFormData.variants || []
      }

      await onSubmit(combinedData)
      await forceSave() // Save any pending changes
      success('Product created successfully with admin privileges!')
      router.push('/admin/products')
    } catch (err) {
      error('Failed to create product')
      throw err
    }
  }, [adminFormData, onSubmit, forceSave, success, error, router])

  return (
    <div className="space-y-6">
      {/* Admin-specific header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Product {initialData?.id ? 'Edit' : 'Creation'}</h1>
            <p className="text-primary-100 mt-1">
              Full administrative privileges with advanced features
              {isSaving && ' • Saving...'}
              {hasUnsavedChanges && ' • Unsaved changes'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="text-sm font-medium">Admin Mode</span>
          </div>
        </div>
      </div>

      {/* Base Product Form */}
      <ProductFormBase
        mode="admin"
        initialData={adminFormData}
        onSubmit={handleAdminSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />

      {/* Admin-specific Advanced Fields */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
            </div>
            <span className="text-sm text-gray-500">
              {showAdvancedFields ? 'Hide' : 'Show'} advanced options
            </span>
          </button>
        </div>

        {showAdvancedFields && (
          <div className="p-6 space-y-6">
            {/* Supplier Assignment */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Supplier Assignment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Supplier
                  </label>
                  <select
                    value={adminFormData.supplierId}
                    onChange={(e) => handleAdminFieldChange('supplierId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">No supplier (admin product)</option>
                    <option value="supplier-1">TechCorp Electronics</option>
                    <option value="supplier-2">Fashion Forward</option>
                    <option value="supplier-3">Home Essentials</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={adminFormData.featured}
                    onChange={(e) => handleAdminFieldChange('featured', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                SEO Settings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={adminFormData.seoTitle}
                    onChange={(e) => handleAdminFieldChange('seoTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={adminFormData.seoDescription}
                    onChange={(e) => handleAdminFieldChange('seoDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="SEO meta description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add keyword"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Add
                    </button>
                  </div>
                  {adminFormData.metaKeywords && adminFormData.metaKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {adminFormData.metaKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping & Tax */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Shipping & Tax
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={adminFormData.taxRate}
                    onChange={(e) => handleAdminFieldChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={adminFormData.shippingWeight}
                    onChange={(e) => handleAdminFieldChange('shippingWeight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Digital Product Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Digital Product Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDigital"
                    checked={adminFormData.isDigital}
                    onChange={(e) => handleAdminFieldChange('isDigital', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDigital" className="ml-2 text-sm text-gray-700">
                    This is a digital product
                  </label>
                </div>

                {adminFormData.isDigital && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Download URL
                    </label>
                    <input
                      type="url"
                      value={adminFormData.downloadUrl}
                      onChange={(e) => handleAdminFieldChange('downloadUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/download"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Status Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Direct Publishing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Admin Privileges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">No Approval Required</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
