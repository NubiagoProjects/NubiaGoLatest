'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, Upload, Save, X, Plus, Trash2, 
  DollarSign, Tag, FileText, Image as ImageIcon,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Camera, Edit3, Eye, Download, Copy, Search
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

export interface ProductFormData {
  name: string
  description: string
  price: number
  comparePrice?: number
  category: string
  images: string[]
  stock: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags: string[]
  isActive: boolean
  requiresApproval: boolean
  // New enhanced fields (optional)
  brandName?: string
  brandRegistry?: string
  modelNumber?: string
  upcEanIsbn?: string
  materialComposition?: string
  sizeCharts?: string
  fitGuides?: string
  otherDetails?: string
}

export interface ProductFormProps {
  mode: 'admin' | 'supplier'
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ProductFormBase({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: ProductFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState<ProductFormData>({
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
    isActive: mode === 'admin', // Admin can publish directly, supplier needs approval
    requiresApproval: mode === 'supplier', // Supplier products require approval
    // New enhanced fields
    brandName: '',
    brandRegistry: '',
    modelNumber: '',
    upcEanIsbn: '',
    materialComposition: '',
    sizeCharts: '',
    fitGuides: '',
    otherDetails: '',
    ...initialData
  })

  const [newTag, setNewTag] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form steps configuration
  const steps = [
    { id: 1, title: 'Basic Info', icon: Package, completed: false },
    { id: 2, title: 'Enhanced Details', icon: Edit3, completed: false },
    { id: 3, title: 'Pricing & Inventory', icon: DollarSign, completed: false },
    { id: 4, title: 'Media & SEO', icon: Camera, completed: false },
    { id: 5, title: 'Review & Submit', icon: CheckCircle, completed: false }
  ]

  // Check step completion
  const checkStepCompletion = (step: number) => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.category && formData.sku)
      case 2:
        return true // Optional fields
      case 3:
        return !!(formData.price > 0 && formData.stock >= 0)
      case 4:
        return formData.images.length > 0
      case 5:
        return true
      default:
        return false
    }
  }

  // Update step completion status
  useEffect(() => {
    steps.forEach(step => {
      step.completed = checkStepCompletion(step.id)
    })
  }, [formData])

  // Handle form field changes
  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle nested field changes
  const handleNestedFieldChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => {
      const parentValue = prev[parentField as keyof ProductFormData]
      if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
        return {
          ...prev,
          [parentField]: {
            ...(parentValue as Record<string, any>),
            [field]: value
          }
        }
      }
      return prev
    })
  }

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      // Simulate image upload - replace with actual Firebase Storage upload
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          // Mock upload - replace with actual upload logic
          await new Promise(resolve => setTimeout(resolve, 1000))
          return `https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2F${file.name}?alt=media&token=mock-token`
        })
      )
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
      success('Images uploaded successfully!')
    } catch (err) {
      error('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  // Remove image
  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category) {
      error('Please fill in all required fields')
      return
    }

    try {
      await onSubmit(formData)
      success(`Product ${mode === 'admin' ? 'created' : 'submitted for approval'} successfully!`)
      router.push(mode === 'admin' ? '/admin/products' : '/supplier/products')
    } catch (err) {
      error('Failed to save product')
    }
  }

  // Calculate progress percentage
  const progressPercentage = (currentStep / steps.length) * 100

  // Generate SKU automatically
  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const sku = `SKU-${timestamp}-${random}`
    handleFieldChange('sku', sku)
  }

  // Copy SKU to clipboard
  const copySKU = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formData.sku)
      success('SKU copied to clipboard!')
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = formData.sku
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      success('SKU copied to clipboard!')
    }
  }

  // Search categories
  const filteredCategories = [
    'Electronics', 'Clothing', 'Home & Living', 'Beauty & Health', 
    'Sports & Outdoors', 'Books & Media', 'Automotive', 'Garden & Outdoor'
  ].filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'admin' ? 'Create New Product' : 'Add New Product'}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step.id === currentStep
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : step.completed
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  step.id === currentStep ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Product Information</h3>
                    <p className="text-gray-600">Let's start with the essential details about your product</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter a clear, descriptive product name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => handleFieldChange('sku', e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="Enter SKU"
                          required
                        />
                        <button
                          type="button"
                          onClick={generateSKU}
                          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Generate SKU"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={copySKU}
                          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Copy SKU"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="Search categories..."
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                      >
                        <option value="">Select category</option>
                        {filteredCategories.map(category => (
                          <option key={category} value={category.toLowerCase()}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleFieldChange('stock', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      placeholder="Describe your product in detail. Include features, benefits, and what makes it special..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.description.length}/1000 characters
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Enhanced Product Details */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Edit3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Product Details</h3>
                    <p className="text-gray-600">Add detailed specifications to help customers make informed decisions</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={formData.brandName || ''}
                        onChange={(e) => handleFieldChange('brandName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter brand name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Registry
                      </label>
                      <input
                        type="text"
                        value={formData.brandRegistry || ''}
                        onChange={(e) => handleFieldChange('brandRegistry', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter brand registry number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Number
                      </label>
                      <input
                        type="text"
                        value={formData.modelNumber || ''}
                        onChange={(e) => handleFieldChange('modelNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter model number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPC/EAN/ISBN
                      </label>
                      <input
                        type="text"
                        value={formData.upcEanIsbn || ''}
                        onChange={(e) => handleFieldChange('upcEanIsbn', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter UPC, EAN, or ISBN"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Composition
                    </label>
                    <textarea
                      value={formData.materialComposition || ''}
                      onChange={(e) => handleFieldChange('materialComposition', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      placeholder="Describe the materials used in this product"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size Charts
                      </label>
                      <textarea
                        value={formData.sizeCharts || ''}
                        onChange={(e) => handleFieldChange('sizeCharts', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                        placeholder="Enter size chart information or measurements"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fit Guides
                      </label>
                      <textarea
                        value={formData.fitGuides || ''}
                        onChange={(e) => handleFieldChange('fitGuides', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                        placeholder="Enter fit guide information and recommendations"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Details
                    </label>
                    <textarea
                      value={formData.otherDetails || ''}
                      onChange={(e) => handleFieldChange('otherDetails', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      placeholder="Any additional product details, features, or specifications"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Inventory */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Inventory</h3>
                    <p className="text-gray-600">Set competitive pricing and manage your inventory levels</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compare Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <input
                          type="number"
                          value={formData.comparePrice || ''}
                          onChange={(e) => handleFieldChange('comparePrice', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity Discounts */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Quantity Discounts
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600 mb-2">1-9</div>
                          <div className="text-sm text-gray-600 mb-1">units</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${formData.price?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">Base price</div>
                        </div>
                        
                        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600 mb-2">10-49</div>
                          <div className="text-sm text-gray-600 mb-1">units</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${formData.price ? (formData.price * 0.95).toFixed(2) : '0.00'}
                          </div>
                          <div className="text-xs text-green-600 font-medium">5% off</div>
                        </div>
                        
                        <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600 mb-2">50+</div>
                          <div className="text-sm text-gray-600 mb-1">units</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${formData.price ? (formData.price * 0.90).toFixed(2) : '0.00'}
                          </div>
                          <div className="text-xs text-green-600 font-medium">10% off</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-center">
                          <strong>💡 Pro Tip:</strong> Quantity discounts are automatically calculated and displayed to customers. 
                          This encourages bulk purchases and increases your average order value.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Properties */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">Physical Properties</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={formData.weight || ''}
                          onChange={(e) => handleFieldChange('weight', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="0.0"
                          min="0"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dimensions
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={formData.dimensions?.length || ''}
                            onChange={(e) => handleNestedFieldChange('dimensions', 'length', parseFloat(e.target.value) || 0)}
                            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="L"
                            min="0"
                            step="0.1"
                          />
                          <input
                            type="number"
                            value={formData.dimensions?.width || ''}
                            onChange={(e) => handleNestedFieldChange('dimensions', 'width', parseFloat(e.target.value) || 0)}
                            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="W"
                            min="0"
                            step="0.1"
                          />
                          <input
                            type="number"
                            value={formData.dimensions?.height || ''}
                            onChange={(e) => handleNestedFieldChange('dimensions', 'height', parseFloat(e.target.value) || 0)}
                            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="H"
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Length × Width × Height (cm)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Media & SEO */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Media & SEO</h3>
                    <p className="text-gray-600">Upload high-quality images and optimize for search engines</p>
                  </div>

                  {/* Images */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Product Images
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Image Upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Upload Product Images</p>
                        <p className="text-gray-600 mb-4">Drag and drop images here, or click to select</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors"
                        >
                          {uploadingImages ? 'Uploading...' : 'Choose Images'}
                        </label>
                        <p className="text-sm text-gray-500 mt-3">
                          Recommended: High-quality images with white background, minimum 1000x1000px
                        </p>
                      </div>

                      {/* Image Preview */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={image}
                                alt={`Product ${index + 1}`}
                                width={200}
                                height={128}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(image)}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                                  Primary
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Tags
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="Add a tag and press Enter"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-primary-600 hover:text-primary-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h3>
                    <p className="text-gray-600">Review your product information before submitting</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{formData.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">SKU:</span>
                            <span className="font-medium">{formData.sku}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium capitalize">{formData.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-medium">{formData.stock} units</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium text-green-600">${formData.price?.toFixed(2)}</span>
                          </div>
                          {formData.comparePrice && formData.comparePrice > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Compare Price:</span>
                              <span className="font-medium text-gray-500 line-through">${formData.comparePrice.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Images:</span>
                            <span className="font-medium">{formData.images.length} uploaded</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tags:</span>
                            <span className="font-medium">{formData.tags.length} added</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Description Preview</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formData.description.length > 200 
                          ? `${formData.description.substring(0, 200)}...` 
                          : formData.description
                        }
                      </p>
                    </div>

                    {/* Status */}
                    {mode === 'supplier' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-yellow-800">Approval Required</h5>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your product will be reviewed by our admin team before being published. 
                              This process typically takes 1-3 business days.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-4">
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!checkStepCompletion(currentStep)}
                      className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || !checkStepCompletion(currentStep)}
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {mode === 'admin' ? 'Create Product' : 'Submit for Approval'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.id === currentStep
                        ? 'bg-primary-600 text-white'
                        : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? '✓' : step.id}
                    </div>
                    <span className={`text-sm ${
                      step.id === currentStep ? 'text-primary-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Product
                </button>
                <button
                  type="button"
                  onClick={generateSKU}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Generate SKU
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>

            {/* Help & Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>• Use clear, descriptive product names</p>
                <p>• Upload high-quality images with white backgrounds</p>
                <p>• Include detailed descriptions and specifications</p>
                <p>• Set competitive pricing with quantity discounts</p>
                <p>• Add relevant tags for better discoverability</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
