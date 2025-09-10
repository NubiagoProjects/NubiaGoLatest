import React from 'react'
import { ArrowLeft } from 'lucide-react'
import ProductEditForm from './product-edit-form'

// Required for static export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ]
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  images: string[]
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const productId = params.id
  
  // Static product data for demo
  const product: Product = {
    id: productId,
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 75000,
    category: 'electronics',
    stock: 15,
    images: [
              '/product-edit-1.jpg'
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-2 text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          </div>
        </div>

        {/* Form */}
        <ProductEditForm product={product} />
      </div>
    </div>
  )
} 