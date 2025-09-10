'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Package, Search, Filter, Grid, List, Edit, Trash2, Eye, MoreHorizontal, ArrowLeft, TrendingUp, TrendingDown,
  CheckCircle, Clock, XCircle, AlertTriangle, ChevronDown
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SupplierProduct {
  id: string
  name: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'rejected'
  category: string
  sales: number
  rating: number
  image: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt: string
  approvedAt?: string
}

export default function SupplierProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<SupplierProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    // Simulate loading products
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          price: 299.99,
          stock: 25,
          status: 'active',
          category: 'Electronics',
          sales: 45,
          rating: 4.8,
          image: '/headphones.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Smart Fitness Watch',
          price: 199.99,
          stock: 15,
          status: 'active',
          category: 'Electronics',
          sales: 32,
          rating: 4.6,
          image: '/watch.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-10'
        },
        {
          id: '3',
          name: 'Laptop Stand',
          price: 49.99,
          stock: 8,
          status: 'pending',
          category: 'Accessories',
          sales: 0,
          rating: 0,
          image: '/laptop-stand.jpg',
          approvalStatus: 'pending',
          submittedAt: '2024-01-20'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddProduct = () => {
    router.push('/products/supplier/create')
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/products/${productId}/edit`)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/supplier"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage your product catalog and track performance</p>
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.approvalStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + p.sales, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <label className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="radio"
                        name="status"
                        value="all"
                        checked={filterStatus === 'all'}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mr-2"
                      />
                      All Status
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={filterStatus === 'active'}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mr-2"
                      />
                      Active
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="radio"
                        name="status"
                        value="pending"
                        checked={filterStatus === 'pending'}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mr-2"
                      />
                      Pending
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={filterStatus === 'draft'}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mr-2"
                      />
                      Draft
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center ml-2">
                    {getApprovalStatusIcon(product.approvalStatus)}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{product.category}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Stock: {product.stock}</span>
                  <span>Sales: {product.sales}</span>
                  <span>Rating: {product.rating}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProduct(product.id)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={handleAddProduct}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                Add Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
