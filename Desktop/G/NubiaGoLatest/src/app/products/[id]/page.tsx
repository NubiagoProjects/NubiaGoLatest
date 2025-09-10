import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { productService } from '@/lib/services/product.service'
import ProductDetailClient from '@/components/product/ProductDetailClient'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = params.id
  
  // Get product data from Firebase
  const product = await productService.getProduct(productId)
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link 
            href="/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    )
  }

  return <ProductDetailClient product={product} />
}