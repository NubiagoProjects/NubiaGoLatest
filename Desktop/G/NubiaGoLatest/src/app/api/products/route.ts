import { NextRequest, NextResponse } from 'next/server'

// Mock data based on the database structure
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    
    let filteredProducts = [...mockProducts]
    
    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Filter by search
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create new product
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      rating: 0,
      reviewCount: 0,
      stock: body.stock || 0
    }
    
    // In a real app, save to database
    mockProducts.push(newProduct)
    
    return NextResponse.json({
      success: true,
      data: newProduct
    }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
