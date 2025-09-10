import { Product, Category } from '@/types'

// Enhanced mock data with more products
let MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    originalPrice: 129.99,
    image: '/product-headphones-1.jpg',
    images: ['/product-headphones-1.jpg', '/product-headphones-2.jpg'],
    category: 'Electronics',
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
    tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'prod-2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitor',
    price: 199.99,
    originalPrice: 249.99,
    image: '/product-watch-1.jpg',
    images: ['/product-watch-1.jpg', '/product-watch-2.jpg', '/product-watch-3.jpg'],
    category: 'Electronics',
    inStock: true,
    rating: 4.3,
    reviewCount: 89,
    tags: ['fitness', 'smartwatch', 'health', 'tracking'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'prod-3',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable 100% organic cotton t-shirt',
    price: 29.99,
    originalPrice: 39.99,
    image: '/product-clothing-1.jpg',
    images: ['/product-clothing-1.jpg', '/product-clothing-2.jpg', '/product-clothing-3.jpg'],
    category: 'Fashion',
    inStock: true,
    rating: 4.7,
    reviewCount: 156,
    tags: ['cotton', 'organic', 'comfortable', 'casual'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'prod-4',
    name: 'Professional Running Shoes',
    description: 'Lightweight running shoes with advanced cushioning',
    price: 129.99,
    originalPrice: 159.99,
    image: '/product-shoes-1.jpg',
    images: ['/product-shoes-1.jpg', '/product-shoes-2.jpg', '/product-shoes-3.jpg'],
    category: 'Sports',
    inStock: true,
    rating: 4.6,
    reviewCount: 203,
    tags: ['running', 'athletic', 'lightweight', 'cushioning'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'prod-5',
    name: 'Natural Face Moisturizer',
    description: 'Hydrating face cream with natural ingredients',
    price: 34.99,
    originalPrice: 44.99,
    image: '/product-cosmetics-1.jpg',
    images: ['/product-cosmetics-1.jpg', '/product-cosmetics-2.jpg', '/product-cosmetics-3.jpg'],
    category: 'Beauty',
    inStock: true,
    rating: 4.4,
    reviewCount: 74,
    tags: ['skincare', 'natural', 'moisturizer', 'hydrating'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'prod-6',
    name: 'Ceramic Plant Pot Set',
    description: 'Beautiful set of 3 ceramic pots for indoor plants',
    price: 49.99,
    originalPrice: 64.99,
    image: '/product-home-1.jpg',
    images: ['/product-home-1.jpg', '/product-furniture-1.jpg', '/product-furniture-2.jpg'],
    category: 'Home & Garden',
    inStock: true,
    rating: 4.2,
    reviewCount: 45,
    tags: ['ceramic', 'plants', 'home', 'decor'],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  }
]

class ProductService {
  // Get all products with pagination
  async getProducts(page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    console.log('Getting products with mock data')
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = MOCK_PRODUCTS.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      total: MOCK_PRODUCTS.length,
      hasMore: endIndex < MOCK_PRODUCTS.length
    }
  }

  // Get product by ID
  async getProduct(id: string): Promise<Product | null> {
    console.log('Getting product by ID with mock data:', id)
    return MOCK_PRODUCTS.find(p => p.id === id) || null
  }

  // Get products by category
  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    console.log('Getting products by category with mock data:', category)
    const filteredProducts = MOCK_PRODUCTS.filter(p => p.category === category)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      hasMore: endIndex < filteredProducts.length
    }
  }

  // Get featured products
  async getFeaturedProducts(limitCount: number = 10): Promise<Product[]> {
    console.log('Getting featured products with mock data')
    return MOCK_PRODUCTS
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limitCount)
  }

  // Get newest products
  async getNewestProducts(limitCount: number = 6): Promise<Product[]> {
    console.log('Getting newest products with mock data')
    return MOCK_PRODUCTS
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, limitCount)
  }

  // Get products on sale (with original price > current price)
  async getProductsOnSale(limitCount: number = 5): Promise<Product[]> {
    console.log('Getting products on sale with mock data')
    return MOCK_PRODUCTS
      .filter(product => product.originalPrice && product.originalPrice > product.price)
      .sort((a, b) => {
        // Sort by discount percentage (highest discount first)
        const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0
        const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0
        return discountB - discountA
      })
      .slice(0, limitCount)
  }

  // Get trending products (high rating + recent)
  async getTrendingProducts(limitCount: number = 8): Promise<Product[]> {
    console.log('Getting trending products with mock data')
    return MOCK_PRODUCTS
      .filter(product => (product.rating || 0) >= 4.0)
      .sort((a, b) => {
        // Combine rating and recency score
        const scoreA = (a.rating || 0) * 0.7 + (a.createdAt ? (new Date(a.createdAt).getTime() / 1000000000000) : 0) * 0.3
        const scoreB = (b.rating || 0) * 0.7 + (b.createdAt ? (new Date(b.createdAt).getTime() / 1000000000000) : 0) * 0.3
        return scoreB - scoreA
      })
      .slice(0, limitCount)
  }

  // Search products with filters
  async searchProducts(searchQuery?: string, filters?: {
    category?: string
    priceRange?: { min: number; max: number }
    rating?: number
  }): Promise<Product[]> {
    console.log('Searching products with mock data:', searchQuery)
    let filteredProducts = MOCK_PRODUCTS.filter(p => p.inStock)
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(lowercaseQuery) ||
        (p.description && p.description.toLowerCase().includes(lowercaseQuery)) ||
        p.category.toLowerCase().includes(lowercaseQuery) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      )
    }

    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category)
    }

    if (filters?.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      )
    }

    if (filters?.rating) {
      filteredProducts = filteredProducts.filter(p => (p.rating || 0) >= filters.rating!)
    }

    return filteredProducts
  }

  // Create new product
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    console.log('Creating product with mock data')
    const mockProduct = {
      id: `mock-${Date.now()}`,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Product
    
    MOCK_PRODUCTS.push(mockProduct)
    return mockProduct
  }

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    console.log('Updating product with mock data:', id)
    const mockProductIndex = MOCK_PRODUCTS.findIndex(p => p.id === id)
    if (mockProductIndex === -1) {
      return null
    }
    
    MOCK_PRODUCTS[mockProductIndex] = {
      ...MOCK_PRODUCTS[mockProductIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    return MOCK_PRODUCTS[mockProductIndex]
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    console.log('Deleting product with mock data:', id)
    const initialLength = MOCK_PRODUCTS.length
    MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id)
    return MOCK_PRODUCTS.length < initialLength
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    console.log('Getting categories with mock data')
    return [
      { id: 'cat-1', name: 'Electronics', isActive: true, productCount: 2 },
      { id: 'cat-2', name: 'Fashion', isActive: true, productCount: 1 },
      { id: 'cat-3', name: 'Sports', isActive: true, productCount: 1 },
      { id: 'cat-4', name: 'Beauty', isActive: true, productCount: 1 },
      { id: 'cat-5', name: 'Home & Garden', isActive: true, productCount: 1 }
    ]
  }

  // Get category by ID
  async getCategory(id: string): Promise<Category | null> {
    console.log('Getting category by ID with mock data:', id)
    const categories = await this.getCategories()
    return categories.find(c => c.id === id) || null
  }
}

export const productService = new ProductService() 
