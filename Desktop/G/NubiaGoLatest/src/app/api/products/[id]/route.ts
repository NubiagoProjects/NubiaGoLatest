import { NextRequest, NextResponse } from 'next/server'

// Mock products data (same as in the main products API)
const mockProducts = [
  {
    id: 'prod-1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'AudioTech',
    imageUrl: '/product-headphones-1.jpg',
    images: ['/product-headphones-1.jpg'],
    thumbnailUrl: '/product-headphones-1.jpg',
    sku: 'AUDIO-001',
    rating: 4.8,
    reviewCount: 156,
    stock: 25,
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['wireless', 'noise-cancelling', 'premium'],
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Weight': '250g'
    }
  },
  {
    id: 'prod-2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: 199.99,
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'FitTech',
    imageUrl: '/product-watch-1.jpg',
    images: ['/product-watch-1.jpg'],
    thumbnailUrl: '/product-watch-1.jpg',
    sku: 'WEAR-001',
    rating: 4.6,
    reviewCount: 89,
    stock: 42,
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['fitness', 'smartwatch', 'health'],
    specifications: {
      'Battery Life': '7 days',
      'Water Resistance': '5ATM',
      'Screen Size': '1.4 inch'
    }
  },
  {
    id: 'prod-3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt for everyday wear',
    price: 29.99,
    category: 'Fashion',
    subcategory: 'Clothing',
    brand: 'EcoWear',
    imageUrl: '/product-clothing-1.jpg',
    images: ['/product-clothing-1.jpg'],
    thumbnailUrl: '/product-clothing-1.jpg',
    sku: 'FASH-001',
    rating: 4.5,
    reviewCount: 234,
    stock: 150,
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['organic', 'cotton', 'comfortable'],
    specifications: {
      'Material': '100% Organic Cotton',
      'Fit': 'Regular',
      'Care': 'Machine wash cold'
    }
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const product = mockProducts.find(p => p.id === id)
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const productIndex = mockProducts.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Update product
    const updatedProduct = {
      ...mockProducts[productIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    mockProducts[productIndex] = updatedProduct
    
    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const productIndex = mockProducts.findIndex(p => p.id === id)
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Soft delete - mark as inactive
    mockProducts[productIndex].isActive = false
    mockProducts[productIndex].updatedAt = new Date().toISOString()
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const productIndex = mockProducts.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Partial update
    const updatedProduct = {
      ...mockProducts[productIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    mockProducts[productIndex] = updatedProduct
    
    return NextResponse.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('Patch product error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
