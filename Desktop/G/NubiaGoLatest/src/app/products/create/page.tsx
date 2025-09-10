'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AdminProductForm from '@/components/product/forms/admin/AdminProductForm'
import { useToast } from '@/components/ui/toast'

interface AdminProductData {
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

export default function AdminCreateProductPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: AdminProductData) => {
    setIsLoading(true)
    try {
      // Simulate API call to create product
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically:
      // 1. Upload images to Firebase Storage
      // 2. Save product data to Firestore
      // 3. Update admin analytics
      // 4. Send notifications if needed
      
      console.log('Admin creating product:', data)
      
      success('Product created successfully!')
      router.push('/admin/products')
    } catch (err) {
      error('Failed to create product')
      console.error('Error creating product:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-600 mt-2">
            Add a new product to the marketplace with full administrative privileges.
          </p>
        </div>

        {/* Admin Product Form */}
        <AdminProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 
