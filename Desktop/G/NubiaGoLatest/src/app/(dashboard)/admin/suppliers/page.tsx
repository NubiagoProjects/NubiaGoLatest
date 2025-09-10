'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Store, Search, Filter, MoreVertical, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Star,
  Download, BarChart3, Grid3X3, User, Mail, Phone
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'

// Use the actual AdminSupplier type from the store
type Supplier = import('@/lib/services/admin/admin-supplier.service').AdminSupplier

export default function AdminSuppliersPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Get data from admin dashboard store
  const {
    suppliers,
    supplierStats,
    loading: supplierLoading,
    fetchSuppliers,
    updateSupplierApproval,
    suspendSupplier,
    reactivateSupplier,
    bulkUpdateSuppliers,
    supplierFilters,
    setSupplierFilters
  } = useAdminDashboardStore()

  // Local loading state for better UX
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)
  const loading = supplierLoading || localLoading

  // Debug information
  useEffect(() => {
    console.log('Admin Suppliers Debug:', {
      supplierLoading,
      localLoading,
      loading,
      suppliersCount: suppliers?.length || 0,
      supplierStats: supplierStats,
      localError
    })
  }, [supplierLoading, localLoading, loading, suppliers, supplierStats, localError])

  // Fallback data to prevent crashes
  const safeSupplierStats = supplierStats || {
    totalSuppliers: 0,
    approvedSuppliers: 0,
    pendingSuppliers: 0,
    rejectedSuppliers: 0,
    suspendedSuppliers: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalProducts: 0,
    activeCategories: 0,
    newSuppliersThisMonth: 0,
    topPerformingSuppliers: 0
  }

  const safeSuppliers = suppliers || []

  // Filter suppliers based on search and filters
  const filteredSuppliers = safeSuppliers.filter(supplier => {
    const matchesSearch = supplier.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        supplier.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        supplier.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus
    const matchesCategory = filterCategory === 'all' || supplier.categories?.includes(filterCategory)
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Fetch suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLocalLoading(true)
        setLocalError(null)
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setLocalError('Request timeout - please refresh the page')
          setLocalLoading(false)
        }, 30000) // 30 seconds timeout
        
        await fetchSuppliers()
        clearTimeout(timeoutId)
      } catch (err) {
        console.error('Failed to fetch suppliers:', err)
        setLocalError(err instanceof Error ? err.message : 'Failed to fetch suppliers')
      } finally {
        setLocalLoading(false)
      }
    }
    
    loadSuppliers()
  }, [fetchSuppliers])

  // Update filters when they change
  useEffect(() => {
    setSupplierFilters({
      ...supplierFilters,
      status: filterStatus === 'all' ? undefined : filterStatus as 'approved' | 'pending' | 'rejected' | 'suspended' | undefined,
      category: filterCategory === 'all' ? undefined : filterCategory,
      search: searchQuery || undefined
    })
  }, [filterStatus, filterCategory, searchQuery, setSupplierFilters, supplierFilters])

  const handleApproveSupplier = async (supplierId: string) => {
    try {
      await updateSupplierApproval(supplierId, 'approved', 'admin-1', 'Supplier approved')
      success('Supplier approved successfully')
    } catch (err) {
      error('Failed to approve supplier')
    }
  }

  const handleRejectSupplier = async (supplierId: string) => {
    try {
      await updateSupplierApproval(supplierId, 'rejected', 'admin-1', 'Supplier rejected')
      success('Supplier rejected successfully')
    } catch (err) {
      error('Failed to reject supplier')
    }
  }

  const handleSuspendSupplier = async (supplierId: string) => {
    try {
      await suspendSupplier(supplierId, 'admin-1', 'Supplier suspended', 30)
      success('Supplier suspended successfully')
    } catch (err) {
      error('Failed to suspend supplier')
    }
  }

  const handleReactivateSupplier = async (supplierId: string) => {
    try {
      await reactivateSupplier(supplierId, 'admin-1', 'Supplier reactivated')
      success('Supplier reactivated successfully')
    } catch (err) {
      error('Failed to reactivate supplier')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedSuppliers.length === 0) return

    try {
      switch (action) {
        case 'approve':
          await bulkUpdateSuppliers(selectedSuppliers, { status: 'approved' }, 'admin-1', 'Bulk approval')
          success(`${selectedSuppliers.length} suppliers approved successfully`)
          break
        case 'reject':
          await bulkUpdateSuppliers(selectedSuppliers, { status: 'rejected' }, 'admin-1', 'Bulk rejection')
          success(`${selectedSuppliers.length} suppliers rejected successfully`)
          break
        case 'suspend':
          await bulkUpdateSuppliers(selectedSuppliers, { status: 'suspended' }, 'admin-1', 'Bulk suspension')
          success(`${selectedSuppliers.length} suppliers suspended successfully`)
          break
        default:
          break
      }
      setSelectedSuppliers([])
    } catch (err) {
      error(`Failed to perform bulk ${action} action`)
    }
  }

  const handleSupplierSelection = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(prev => [...prev, supplierId])
    } else {
      setSelectedSuppliers(prev => prev.filter(id => id !== supplierId))
    }
  }

  const handleSelectAllSuppliers = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(safeSuppliers.map(supplier => supplier.id))
    } else {
      setSelectedSuppliers([])
    }
  }

  if (loading) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your data...</p>
            {localError && (
              <p className="text-red-500 text-sm mt-2">Error: {localError}</p>
            )}
          </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
                <p className="text-gray-600 mt-1">Manage suppliers, approve applications, and monitor performance</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
                <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
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
                    <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900">{safeSupplierStats.totalSuppliers.toLocaleString()}</p>
                  </div>
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{safeSupplierStats.newSuppliersThisMonth} new this month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{safeSupplierStats.approvedSuppliers.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Active suppliers</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{safeSupplierStats.pendingSuppliers.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Awaiting approval</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${safeSupplierStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <Store className="h-4 w-4 mr-1" />
                  <span>From suppliers</span>
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
                    { id: 'suppliers', label: 'All Suppliers', icon: Store },
                    { id: 'pending', label: 'Pending', icon: Clock },
                    { id: 'approved', label: 'Approved', icon: CheckCircle },
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
                        <Store className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Review Applications</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Performance Analytics</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Export Reports</p>
                      </button>
                    </div>

                    {/* Recent Suppliers */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Suppliers</h3>
                      <div className="space-y-3">
                        {safeSuppliers.slice(0, 5).map((supplier) => (
                          <div key={supplier.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Store className="h-4 w-4 text-gray-600" />
                              </div>
                                                             <div>
                                 <p className="font-medium text-gray-900">{supplier.businessName}</p>
                                 <p className="text-gray-500">{supplier.ownerName} • {supplier.categories?.[0] || 'Uncategorized'}</p>
                               </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              supplier.status === 'approved' ? 'bg-green-100 text-green-800' :
                              supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              supplier.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {supplier.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'suppliers' && (
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search suppliers..."
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
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
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
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedSuppliers.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-blue-800">
                            {selectedSuppliers.length} supplier(s) selected
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBulkAction('approve')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
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
                              onClick={() => handleBulkAction('suspend')}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                            >
                              Suspend
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suppliers Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedSuppliers.length === safeSuppliers.length}
                                onChange={(e) => handleSelectAllSuppliers(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Business
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredSuppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedSuppliers.includes(supplier.id)}
                                  onChange={(e) => handleSupplierSelection(supplier.id, e.target.checked)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Store className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{supplier.businessName}</div>
                                    <div className="text-sm text-gray-500">{supplier.categories?.[0] || 'No category'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">{supplier.ownerName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm text-gray-900">
                                    <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                    {supplier.ownerEmail}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                    {supplier.ownerPhone}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  supplier.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  supplier.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {supplier.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-900">
                                    {supplier.businessMetrics?.totalOrders || 0} orders
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${(supplier.businessMetrics?.totalRevenue || 0).toLocaleString()}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                    <span className="text-xs text-gray-600">{supplier.businessMetrics?.averageRating || 'N/A'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {supplier.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveSupplier(supplier.id)}
                                        className="text-green-600 hover:text-green-900"
                                        title="Approve"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleRejectSupplier(supplier.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Reject"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                  {supplier.status === 'approved' && (
                                    <button
                                      onClick={() => handleSuspendSupplier(supplier.id)}
                                      className="text-yellow-600 hover:text-yellow-900"
                                      title="Suspend"
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </button>
                                  )}
                                  {supplier.status === 'suspended' && (
                                    <button
                                      onClick={() => handleReactivateSupplier(supplier.id)}
                                      className="text-green-600 hover:text-green-900"
                                      title="Reactivate"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => router.push(`/admin/suppliers/${supplier.id}`)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => router.push(`/admin/suppliers/${supplier.id}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
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
                              Business
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                                                     {safeSuppliers.filter(s => s.status === 'pending').map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{supplier.businessName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {supplier.ownerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{supplier.ownerEmail}</div>
                                <div className="text-sm text-gray-500">{supplier.ownerPhone}</div>
                              </td>
                                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {supplier.categories?.[0] || supplier.businessType || 'N/A'}
                                </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveSupplier(supplier.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectSupplier(supplier.id)}
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

                {activeTab === 'approved' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Business
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                                                     {safeSuppliers.filter(s => s.status === 'approved').map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{supplier.businessName}</div>
                                <div className="text-sm text-gray-500">{supplier.categories?.[0] || supplier.businessType || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {supplier.ownerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {supplier.businessMetrics?.totalOrders || 0} orders • ${(supplier.businessMetrics?.totalRevenue || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Rating: {supplier.businessMetrics?.averageRating || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleSuspendSupplier(supplier.id)}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    Suspend
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Suppliers</h3>
                        <div className="space-y-3">
                          {safeSuppliers
                            .filter(s => s.status === 'approved')
                            .sort((a, b) => (b.businessMetrics?.totalRevenue || 0) - (a.businessMetrics?.totalRevenue || 0))
                            .slice(0, 5)
                            .map((supplier, index) => (
                              <div key={supplier.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                  <span className="text-sm text-gray-900">{supplier.businessName}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  ${(supplier.businessMetrics?.totalRevenue || 0).toLocaleString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
                        <div className="space-y-3">
                                                     {Object.entries(
                             safeSuppliers.reduce((acc, supplier) => {
                               const category = supplier.categories?.[0] || supplier.businessType || 'Other'
                               acc[category] = (acc[category] || 0) + 1
                               return acc
                             }, {} as Record<string, number>)
                           )
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, count]) => (
                              <div key={category} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{category}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                              </div>
                            ))}
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
