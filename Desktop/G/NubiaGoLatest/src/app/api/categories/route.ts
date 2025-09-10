import { NextRequest, NextResponse } from 'next/server'

// Mock categories data based on the database structure
const mockCategories = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets',
    slug: 'electronics',
    imageUrl: '/category-electronics.jpg',
    thumbnailUrl: '/category-electronics.jpg',
    parentId: null,
    level: 1,
    order: 1,
    isActive: true,
    isFeatured: true,
    productCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subcategories: [
      {
        id: 'cat-1-1',
        name: 'Audio',
        description: 'Headphones, speakers, and audio equipment',
        slug: 'audio',
        parentId: 'cat-1',
        level: 2,
        order: 1,
        isActive: true,
        productCount: 23
      },
      {
        id: 'cat-1-2',
        name: 'Wearables',
        description: 'Smartwatches, fitness trackers, and wearables',
        slug: 'wearables',
        parentId: 'cat-1',
        level: 2,
        order: 2,
        isActive: true,
        productCount: 18
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    slug: 'fashion',
    imageUrl: '/category-men.jpg',
    thumbnailUrl: '/category-men.jpg',
    parentId: null,
    level: 1,
    order: 2,
    isActive: true,
    isFeatured: true,
    productCount: 67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subcategories: [
      {
        id: 'cat-2-1',
        name: 'Clothing',
        description: 'T-shirts, jeans, dresses, and more',
        slug: 'clothing',
        parentId: 'cat-2',
        level: 2,
        order: 1,
        isActive: true,
        productCount: 45
      },
      {
        id: 'cat-2-2',
        name: 'Accessories',
        description: 'Bags, shoes, jewelry, and accessories',
        slug: 'accessories',
        parentId: 'cat-2',
        level: 2,
        order: 2,
        isActive: true,
        productCount: 22
      }
    ]
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    description: 'Furniture and home decor items',
    slug: 'home-living',
    imageUrl: '/category-home-living.jpg',
    thumbnailUrl: '/category-home-living.jpg',
    parentId: null,
    level: 1,
    order: 3,
    isActive: true,
    isFeatured: false,
    productCount: 34,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subcategories: [
      {
        id: 'cat-3-1',
        name: 'Furniture',
        description: 'Tables, chairs, sofas, and furniture',
        slug: 'furniture',
        parentId: 'cat-3',
        level: 2,
        order: 1,
        isActive: true,
        productCount: 20
      },
      {
        id: 'cat-3-2',
        name: 'Decor',
        description: 'Wall art, vases, and decorative items',
        slug: 'decor',
        parentId: 'cat-3',
        level: 2,
        order: 2,
        isActive: true,
        productCount: 14
      }
    ]
  },
  {
    id: 'cat-4',
    name: 'Health & Beauty',
    description: 'Personal care and beauty products',
    slug: 'health-beauty',
    imageUrl: '/category-cosmetics.jpg',
    thumbnailUrl: '/category-cosmetics.jpg',
    parentId: null,
    level: 1,
    order: 4,
    isActive: true,
    isFeatured: false,
    productCount: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subcategories: [
      {
        id: 'cat-4-1',
        name: 'Skincare',
        description: 'Face creams, cleansers, and skincare',
        slug: 'skincare',
        parentId: 'cat-4',
        level: 2,
        order: 1,
        isActive: true,
        productCount: 16
      },
      {
        id: 'cat-4-2',
        name: 'Makeup',
        description: 'Cosmetics, lipsticks, and makeup',
        slug: 'makeup',
        parentId: 'cat-4',
        level: 2,
        order: 2,
        isActive: true,
        productCount: 12
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const parentId = searchParams.get('parentId')
    const level = searchParams.get('level')
    
    let filteredCategories = [...mockCategories]
    
    // Filter featured categories
    if (featured === 'true') {
      filteredCategories = filteredCategories.filter(cat => cat.isFeatured)
    }
    
    // Filter by parent ID
    if (parentId) {
      filteredCategories = filteredCategories.filter(cat => cat.parentId === parentId)
    }
    
    // Filter by level
    if (level) {
      filteredCategories = filteredCategories.filter(cat => cat.level === parseInt(level))
    }
    
    return NextResponse.json({
      success: true,
      data: filteredCategories,
      total: filteredCategories.length
    })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create new category
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      productCount: 0,
      level: body.parentId ? 2 : 1,
      order: body.order || 1
    }
    
    // In a real app, save to database
    mockCategories.push(newCategory)
    
    return NextResponse.json({
      success: true,
      data: newCategory
    }, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
