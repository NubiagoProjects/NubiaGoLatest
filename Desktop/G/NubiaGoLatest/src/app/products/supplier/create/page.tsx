'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SupplierProductForm from '@/components/product/forms/supplier/SupplierProductForm'
import { useToast } from '@/components/ui/toast'

interface SupplierProductData {
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
  supplierId: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt?: Date
  approvedAt?: Date
  approvedBy?: string
  commissionRate?: number
  isFeatured: boolean
  maxOrderQuantity?: number
  minOrderQuantity?: number
  leadTime?: number
}

export default function SupplierCreateProductPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [supplierId, setSupplierId] = useState<string>('')

  // In a real app, you'd get the supplier ID from authentication context
  useEffect(() => {
    // Simulate getting supplier ID from auth context
    setSupplierId('supplier-123')
  }, [])

  const handleSubmit = async (data: SupplierProductData) => {
    setIsLoading(true)
    try {
      // Simulate API call to submit product for approval
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically:
      // 1. Upload images to Firebase Storage
      // 2. Save product data to Firestore with pending status
      // 3. Send notification to admin team
      // 4. Update supplier analytics
      
      console.log('Supplier submitting product for approval:', data)
      
      success('Product submitted for approval successfully!')
      router.push('/products/supplier')
    } catch (err) {
      error('Failed to submit product for approval')
      console.error('Error submitting product:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/products/supplier')
  }

  // Show loading while getting supplier ID
  if (!supplierId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">
            Submit a new product for admin approval. Your product will be reviewed before being published.
          </p>
        </div>

        {/* Supplier Product Form */}
        <SupplierProductForm
          supplierId={supplierId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 
