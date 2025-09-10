'use client'

import { useState, useRef } from 'react'
import { 
  Upload, Download, FileText, X, CheckCircle, AlertCircle, 
  Info, ArrowDown, Plus, Trash2, Eye, Edit, Save
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface BulkProductData {
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  brandName?: string
  modelNumber?: string
  upcEanIsbn?: string
  materialComposition?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  productHighlights?: string[]
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface BulkUploadResult {
  success: boolean
  message: string
  processed: number
  errors: ValidationError[]
  products: BulkProductData[]
}

export default function BulkProductUpload() {
  const { success, error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<BulkProductData[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'confirm' | 'complete'>('upload')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showTemplate, setShowTemplate] = useState(false)

  // CSV Template for download
  const csvTemplate = [
    'Name,Description,Price,Category,Stock,SKU,Brand Name,Model Number,UPC/EAN/ISBN,Material Composition,Weight,Length,Width,Height,Tags,SEO Title,SEO Description,Meta Keywords,Product Highlights',
    'Sample Product,This is a sample product description,99.99,Electronics,100,SAMPLE-001,Sample Brand,SAMPLE-MODEL,1234567890123,Plastic,0.5,10,5,2,"tag1,tag2",SEO Title,SEO Description,"keyword1,keyword2","highlight1,highlight2"'
  ].join('\n')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.match(/\.(csv|xlsx?)$/i)) {
      error('Please upload a CSV or Excel file')
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate file processing
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Parse file content (simulated)
      const mockData: BulkProductData[] = [
        {
          name: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 299.99,
          category: 'Electronics',
          stock: 50,
          sku: 'HEAD-001',
          brandName: 'AudioTech',
          modelNumber: 'WH-2000',
          upcEanIsbn: '1234567890123',
          materialComposition: 'Plastic, Metal',
          weight: 0.3,
          dimensions: { length: 20, width: 15, height: 8 },
          tags: ['wireless', 'noise-cancelling', 'premium'],
          seoTitle: 'Premium Wireless Headphones - AudioTech',
          seoDescription: 'High-quality wireless headphones with advanced noise cancellation technology',
          metaKeywords: ['wireless headphones', 'noise cancellation', 'premium audio'],
          productHighlights: ['Active noise cancellation', '30-hour battery life', 'Premium build quality']
        },
        {
          name: 'Smart Fitness Watch',
          description: 'Advanced fitness tracking smartwatch',
          price: 199.99,
          category: 'Electronics',
          stock: 75,
          sku: 'WATCH-001',
          brandName: 'FitTech',
          modelNumber: 'FW-500',
          upcEanIsbn: '9876543210987',
          materialComposition: 'Silicone, Stainless Steel',
          weight: 0.05,
          dimensions: { length: 4, width: 4, height: 1 },
          tags: ['fitness', 'smartwatch', 'tracking'],
          seoTitle: 'Smart Fitness Watch - FitTech',
          seoDescription: 'Advanced fitness tracking smartwatch with health monitoring',
          metaKeywords: ['fitness watch', 'smartwatch', 'health tracking'],
          productHighlights: ['Heart rate monitoring', 'GPS tracking', 'Water resistant']
        }
      ]

      setPreviewData(mockData)
      setCurrentStep('preview')
      success('File uploaded successfully! Please review the data before proceeding.')
    } catch (err) {
      error('Failed to process file. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const validateData = (data: BulkProductData[]): ValidationError[] => {
    const errors: ValidationError[] = []
    
    data.forEach((product, index) => {
      const row = index + 1
      
      if (!product.name || product.name.trim().length < 2) {
        errors.push({ row, field: 'name', message: 'Product name must be at least 2 characters' })
      }
      
      if (!product.description || product.description.trim().length < 10) {
        errors.push({ row, field: 'description', message: 'Description must be at least 10 characters' })
      }
      
      if (!product.price || product.price <= 0) {
        errors.push({ row, field: 'price', message: 'Price must be greater than 0' })
      }
      
      if (!product.category) {
        errors.push({ row, field: 'category', message: 'Category is required' })
      }
      
      if (!product.stock || product.stock < 0) {
        errors.push({ row, field: 'stock', message: 'Stock must be 0 or greater' })
      }
      
      if (!product.sku) {
        errors.push({ row, field: 'sku', message: 'SKU is required' })
      }
    })
    
    return errors
  }

  const handlePreviewContinue = () => {
    const errors = validateData(previewData)
    setValidationErrors(errors)
    
    if (errors.length === 0) {
      setCurrentStep('confirm')
    } else {
      error(`Found ${errors.length} validation errors. Please fix them before proceeding.`)
    }
  }

  const handleConfirmUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate bulk upload process
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setCurrentStep('complete')
      success(`Successfully uploaded ${previewData.length} products!`)
    } catch (err) {
      error('Failed to upload products. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setPreviewData([])
    setValidationErrors([])
    setCurrentStep('upload')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-upload-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Product Upload</h3>
        <p className="text-gray-600">Upload a CSV or Excel file to add multiple products at once</p>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Download Template</h4>
              <p className="text-sm text-blue-700">Use our CSV template to ensure proper formatting</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">Drop your file here</p>
          <p className="text-gray-600">or click to browse</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          disabled={isUploading}
        >
          {isUploading ? 'Processing...' : 'Choose File'}
        </button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing file...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Preview Data</h3>
          <p className="text-gray-600">Review your products before uploading</p>
        </div>
        <button
          onClick={handleReset}
          className="text-gray-600 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-medium text-red-900">
              {validationErrors.length} validation error(s) found
            </h4>
          </div>
          <div className="space-y-2">
            {validationErrors.slice(0, 5).map((err, index) => (
              <div key={index} className="text-sm text-red-700">
                Row {err.row}: {err.field} - {err.message}
              </div>
            ))}
            {validationErrors.length > 5 && (
              <div className="text-sm text-red-700">
                ... and {validationErrors.length - 5} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            {previewData.length} products ready for upload
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePreviewContinue}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          disabled={validationErrors.length > 0}
        >
          Continue
        </button>
      </div>
    </div>
  )

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Upload</h3>
        <p className="text-gray-600">Ready to upload {previewData.length} products?</p>
      </div>

      {/* Upload Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{previewData.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {previewData.filter(p => p.price > 0).length}
            </div>
            <div className="text-sm text-gray-600">Valid Products</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {previewData.reduce((sum, p) => sum + p.stock, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Stock</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {previewData.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading products...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setCurrentStep('preview')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={isUploading}
        >
          Back
        </button>
        <button
          onClick={handleConfirmUpload}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Products
            </>
          )}
        </button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Complete!</h3>
        <p className="text-gray-600">
          Successfully uploaded {previewData.length} products to your catalog.
        </p>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Next Steps</h4>
        <ul className="text-sm text-blue-700 space-y-1 text-left">
          <li>• Review your products in the catalog</li>
          <li>• Set up pricing and inventory</li>
          <li>• Add product images and descriptions</li>
          <li>• Submit for approval</li>
        </ul>
      </div>

      <div className="flex justify-center space-x-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Upload More Products
        </button>
        <button
          onClick={() => window.location.href = '/products/supplier'}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          View Products
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  )
}
