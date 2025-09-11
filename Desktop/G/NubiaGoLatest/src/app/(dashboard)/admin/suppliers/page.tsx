'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Star,
  Eye,
  Edit,
  RefreshCw,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DataTable from '@/components/dashboard/DataTable'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useToast } from '@/components/ui/toast'

export default function AdminSuppliersPage() {
  const router = useRouter()
  const { suppliers, supplierStats, loading, fetchSuppliers } = useAdminDashboardStore()
  const { success, error: errorToast, warning } = useToast()
  
  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [supplierFilters, setSupplierFilters] = useState({
    status: 'all',
    category: 'all'
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Handler functions
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  const handleFilterChange = (filterKey: string, value: string) => {
    setSupplierFilters(prev => ({ ...prev, [filterKey]: value }))
  }

  const handleAddSupplier = () => {
    router.push('/admin/suppliers/new')
  }

  const handleExport = () => {
    success('Export started', 'Supplier data export will be ready shortly')
  }

  const handleRefresh = async () => {
    await fetchSuppliers()
    success('Data refreshed successfully')
  }

  // Filter suppliers based on search and filters
  const filteredSuppliers = suppliers.filter((supplier: any) => {
    const matchesSearch = !searchValue || 
      supplier.businessName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      supplier.ownerEmail?.toLowerCase().includes(searchValue.toLowerCase()) ||
      supplier.businessType?.toLowerCase().includes(searchValue.toLowerCase())
    
    const statusFilter = supplierFilters.status || 'all'
    const matchesStatus = statusFilter === 'all' || supplier.approvalStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Bulk action handlers
  const handleBulkAction = async (action: string) => {
    if (selectedSuppliers.length === 0) {
      warning('No suppliers selected', 'Please select suppliers to perform bulk actions')
      return
    }

    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended'
      success(`${selectedSuppliers.length} supplier(s) ${actionText} successfully`)
      setSelectedSuppliers([])
      
      // Refresh data
      await fetchSuppliers()
    } catch (error) {
      errorToast(`Failed to ${action} suppliers`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAllSuppliers = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(filteredSuppliers.map((s: Supplier) => s.uid))
    } else {
      setSelectedSuppliers([])
    }
  }

  const handleSupplierSelection = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(prev => [...prev, supplierId])
    } else {
      setSelectedSuppliers(prev => prev.filter(id => id !== supplierId))
    }
  }

  const handleApproveSupplier = async (supplierId: string) => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Supplier approved successfully')
      await fetchSuppliers()
    } catch (error) {
      errorToast('Failed to approve supplier')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectSupplier = async (supplierId: string) => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Supplier rejected successfully')
      await fetchSuppliers()
    } catch (error) {
      errorToast('Failed to reject supplier')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspendSupplier = async (supplierId: string) => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Supplier suspended successfully')
      await fetchSuppliers()
    } catch (error) {
      errorToast('Failed to suspend supplier')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminAuthGuard>
    )
  }

  // Filter configuration
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'suspended', label: 'Suspended' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Clothing', label: 'Clothing' },
        { value: 'Home & Living', label: 'Home & Living' },
        { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' }
      ]
    }
  ]

  // Tab configuration
  const tabs = [
    { key: 'overview', label: 'Overview', count: suppliers.length },
    { key: 'suppliers', label: 'All Suppliers', count: suppliers.length },
    { key: 'pending', label: 'Pending', count: suppliers.filter(s => s.approvalStatus === 'pending').length },
    { key: 'approved', label: 'Approved', count: suppliers.filter(s => s.approvalStatus === 'approved').length }
  ]

  return (
    <AdminAuthGuard>
      <ModernSubpageLayout
        title="Supplier Management"
        subtitle="Manage suppliers, approve applications, and monitor performance"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Suppliers' }
        ]}
        showAddButton
        addButtonText="Add Supplier"
        onAddClick={handleAddSupplier}
        showExportButton
        onExportClick={handleExport}
        headerActions={
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{supplierStats?.totalSuppliers || suppliers.length}</p>
                </div>
                <Store className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.filter(s => s.approvalStatus === 'approved').length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{suppliers.filter(s => s.approvalStatus === 'pending').length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${supplierStats?.totalRevenue?.toLocaleString() || '0'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Store className="h-4 w-4 mr-1" />
                <span>From suppliers</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            filters={filters}
            activeFilters={supplierFilters}
            onFilterChange={handleFilterChange}
          />

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supplier Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Performance</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder - Supplier performance metrics</p>
                </div>
              </div>

              {/* Recent Suppliers */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Suppliers</h3>
                <div className="space-y-3">
                  {suppliers.slice(0, 5).map((supplier: any) => (
                    <div key={supplier.uid} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{supplier.businessName}</p>
                          <p className="text-gray-500">{supplier.businessType}</p>
                        </div>
                      </div>
                      <StatusBadge status={supplier.approvalStatus} variant="dot" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-4">
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
              <DataTable
                data={filteredSuppliers}
                columns={[
                  {
                    key: 'business',
                    label: 'Business',
                    render: (supplier: any) => (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{supplier.businessName}</div>
                          <div className="text-sm text-gray-500">{supplier.businessType}</div>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'owner',
                    label: 'Owner',
                    render: (supplier: any) => (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{supplier.ownerName}</span>
                      </div>
                    )
                  },
                  {
                    key: 'contact',
                    label: 'Contact',
                    render: (supplier: any) => (
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
                    )
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (supplier: any) => (
                      <StatusBadge status={supplier.approvalStatus} />
                    )
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (supplier: any) => (
                      <div className="flex space-x-2">
                        {supplier.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveSupplier(supplier.uid)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectSupplier(supplier.uid)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {supplier.approvalStatus === 'approved' && (
                          <button
                            onClick={() => handleSuspendSupplier(supplier.uid)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Suspend"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/suppliers/${supplier.uid}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  }
                ]}
              />
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
                    {suppliers.filter((s: any) => s.approvalStatus === 'pending').map((supplier: any) => (
                      <tr key={supplier.uid} className="hover:bg-gray-50">
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
                          {supplier.businessType || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveSupplier(supplier.uid)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectSupplier(supplier.uid)}
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
                    {suppliers.filter((s: any) => s.approvalStatus === 'approved').map((supplier: any) => (
                      <tr key={supplier.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier.businessName}</div>
                          <div className="text-sm text-gray-500">{supplier.businessType || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {supplier.ownerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Active supplier
                          </div>
                          <div className="text-sm text-gray-500">
                            Good standing
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSuspendSupplier(supplier.uid)}
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
        </div>
      </ModernSubpageLayout>
    </AdminAuthGuard>
  )
}
