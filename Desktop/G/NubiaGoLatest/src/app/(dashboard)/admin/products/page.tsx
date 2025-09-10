'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Star, TrendingUp,
  Download, Upload, Settings, BarChart3, Grid3X3, List
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  category: string
  supplier: string
  sales: number
  rating: number
  image: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  approvedAt?: string
  isFeatured: boolean
  commissionRate: number
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterApproval, setFilterApproval] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  // Get data from admin dashboard store
  const {
    products,
    productStats,
    loading,
    fetchProducts,
    updateProductApproval,
    updateProductStatus,
    bulkUpdateProducts,
    deleteProduct,
    productFilters,
    setProductFilters
  } = useAdminDashboardStore()

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.id?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    const matchesApproval = filterApproval === 'all' || product.approvalStatus === filterApproval
    
    return matchesSearch && matchesStatus && matchesCategory && matchesApproval
  })

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Update filters when they change
  useEffect(() => {
    setProductFilters({
      ...productFilters,
      status: filterStatus === 'all' ? undefined : filterStatus as 'active' | 'inactive' | 'draft' | undefined,
      category: filterCategory === 'all' ? undefined : filterCategory,
      approvalStatus: filterApproval === 'all' ? undefined : filterApproval as 'pending' | 'approved' | 'rejected' | undefined,
      search: searchQuery || undefined
    })
  }, [filterStatus, filterCategory, filterApproval, searchQuery, setProductFilters, productFilters])

  const handleAddProduct = () => {
    router.push('/products/create')
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/products/${productId}/edit`)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId, 'admin-1', 'Product deletion')
        success('Product deleted successfully')
      } catch (err) {
        error('Failed to delete product')
      }
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) return

    try {
      switch (action) {
        case 'activate':
          await bulkUpdateProducts(selectedProducts, { status: 'active' }, 'admin-1', 'Bulk activation')
          success(`${selectedProducts.length} products activated successfully`)
          break
        case 'deactivate':
          await bulkUpdateProducts(selectedProducts, { status: 'inactive' }, 'admin-1', 'Bulk deactivation')
          success(`${selectedProducts.length} products deactivated successfully`)
          break
        case 'approve':
          await bulkUpdateProducts(selectedProducts, { approvalStatus: 'approved' }, 'admin-1', 'Bulk approval')
          success(`${selectedProducts.length} products approved successfully`)
          break
        case 'reject':
          await bulkUpdateProducts(selectedProducts, { approvalStatus: 'rejected' }, 'admin-1', 'Bulk rejection')
          success(`${selectedProducts.length} products rejected successfully`)
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            await Promise.all(selectedProducts.map(id => deleteProduct(id, 'admin-1', 'Bulk deletion')))
            success(`${selectedProducts.length} products deleted successfully`)
          }
          break
        default:
          break
      }
      setSelectedProducts([])
    } catch (err) {
      error(`Failed to perform bulk ${action} action`)
    }
  }

  const handleProductSelection = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(product => product.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleApproveProduct = async (productId: string) => {
    try {
      await updateProductApproval(productId, 'approved', 'admin-1', 'Product approved')
      success('Product approved successfully')
    } catch (err) {
      error('Failed to approve product')
    }
  }

  const handleRejectProduct = async (productId: string) => {
    try {
      await updateProductApproval(productId, 'rejected', 'admin-1', 'Product rejected')
      success('Product rejected successfully')
    } catch (err) {
      error('Failed to reject product')
    }
  }

  if (loading) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AdminAuthGuard>
    )
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-sm px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600 mt-1">Manage products, approve listings, and monitor inventory</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Bulk Upload</span>
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>
          </header>

          {/* Stats Overview */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{productStats.totalProducts.toLocaleString()}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{productStats.activeProducts} active</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">{productStats.pendingApproval.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Awaiting review</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{productStats.totalSales.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Total units sold</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{productStats.totalCategories.toLocaleString()}</p>
                  </div>
                  <Grid3X3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-purple-600">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>Active categories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-8 pb-8">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Grid3X3 },
                    { id: 'products', label: 'All Products', icon: Package },
                    { id: 'pending', label: 'Pending Approval', icon: Clock },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Add New Product</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Bulk Upload</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">View Analytics</p>
                      </button>
                    </div>

                    {/* Recent Products */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Products</h3>
                      <div className="space-y-3">
                        {products.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-gray-500">{product.supplier?.name || 'Unknown Supplier'} • ${product.price}</p>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.approvalStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                        </select>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Categories</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Home & Living">Home & Living</option>
                          <option value="Shoes & Bags">Shoes & Bags</option>
                          <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                          <option value="Mother & Child">Mother & Child</option>
                        </select>
                        <select
                          value={filterApproval}
                          onChange={(e) => setFilterApproval(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Approval</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedProducts.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-blue-800">
                            {selectedProducts.length} product(s) selected
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBulkAction('activate')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Activate
                            </button>
                            <button
                              onClick={() => handleBulkAction('deactivate')}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleBulkAction('approve')}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleBulkAction('reject')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleBulkAction('delete')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedProducts.length === products.length}
                                onChange={(e) => handleSelectAllProducts(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Approval
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.supplier?.name || 'Unknown Supplier'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${product.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.stock}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                                  product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {product.approvalStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {product.approvalStatus === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveProduct(product.id)}
                                        className="text-green-600 hover:text-green-900"
                                        title="Approve"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleRejectProduct(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Reject"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleViewProduct(product.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditProduct(product.id)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'pending' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Supplier
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.filter(p => p.approvalStatus === 'pending').map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">${product.price}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.supplier?.name || 'Unknown Supplier'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.submittedAt ? 
                                  (product.submittedAt instanceof Date ? 
                                    product.submittedAt.toLocaleDateString() : 
                                    'Date format error') 
                                  : 'Unknown date'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveProduct(product.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectProduct(product.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Statistics</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Products</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.totalProducts}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Active Products</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.activeProducts}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Approval</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.pendingApproval}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Low Stock</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.lowStockProducts}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Overview</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Categories</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.totalCategories}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Suppliers</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.totalSuppliers}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Featured Products</span>
                            <span className="text-sm font-medium text-gray-900">{productStats.featuredProducts}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Average Price</span>
                            <span className="text-sm font-medium text-gray-900">${productStats.averagePrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
