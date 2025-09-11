'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Shield, Store, UserCheck, UserX, UserPlus, 
  Search, Filter, MoreVertical, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Plus,
  Sun, Moon, LogOut, BarChart3, Settings, Calendar,
  Mail, Bell, ChevronDown, Globe, FileText, Download,
  ArrowUpRight, TrendingUp, Activity, Grid3X3
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DataTable from '@/components/dashboard/DataTable'

interface SupplierProfile {
  uid: string
  businessName: string
  businessType: string
  phoneNumber: string
  documentUrls: string[]
  approvalStatus: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  approvedAt?: Date
  approvedBy?: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { success, error, warning } = useToast()
  const { 
    users, 
    fetchUsers, 
    deleteUser, 
    bulkUpdateUsers,
    updateUserRole,
    loading,
    userStats,
    userFilters,
    setUserFilters
  } = useAdminDashboardStore()
  
  const [searchValue, setSearchValue] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin'
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchValue || 
      user.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase())
    
    const statusFilter = userFilters.status || 'all'
    const roleFilter = userFilters.role || 'all'
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  // Filter suppliers from users
  const suppliers = users.filter(user => user.role === 'supplier')
  const admins = users.filter(user => user.role === 'admin' || user.role === 'super_admin')

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setUserFilters({
      ...userFilters,
      [key]: value
    })
  }

  // Handle add user
  const handleAddUser = () => {
    setShowCreateAdmin(true)
  }

  // Handle export
  const handleExport = () => {
    success('Export started', 'User data export will be ready shortly')
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers()
    success('Data refreshed', 'User data has been updated')
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      warning('No users selected', 'Please select users to perform bulk actions')
      return
    }

    try {
      switch (action) {
        case 'activate':
          await bulkUpdateUsers(selectedUsers, { status: 'active' })
          success('Users activated', `${selectedUsers.length} users have been activated`)
          break
        case 'suspend':
          await bulkUpdateUsers(selectedUsers, { status: 'suspended' })
          warning('Users suspended', `${selectedUsers.length} users have been suspended`)
          break
        case 'delete':
          // Show confirmation toast before deletion
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
            for (const userId of selectedUsers) {
              await deleteUser(userId, 'admin-1', 'Bulk user deletion')
            }
            success('Users deleted', `${selectedUsers.length} users have been deleted`)
          }
          break
        default:
          warning('Unknown action', 'The requested action is not supported')
      }
      setSelectedUsers([])
    } catch (err) {
      error('Action failed', 'Failed to perform bulk action. Please try again.')
    }
  }

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    } else if (users.some(user => user.email === formData.email)) {
      errors.email = 'This email is already registered'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      error('Form validation failed', 'Please correct the errors and try again')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      success('Admin created', `Admin user ${formData.name} has been created successfully`)
      
      // Reset form and close modal
      setFormData({ name: '', email: '', role: 'admin' })
      setFormErrors({})
      setShowCreateAdmin(false)
      
      // Refresh users list
      fetchUsers()
    } catch (err) {
      error('Creation failed', 'Failed to create admin user. Please try again.')
    } finally {
      setIsSubmitting(false)
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

  // Available filters
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'customer', label: 'Customer' },
        { value: 'supplier', label: 'Supplier' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' }
      ]
    }
  ]

  // Tab configuration
  const tabs = [
    { key: 'overview', label: 'Overview', count: users.length },
    { key: 'users', label: 'All Users', count: users.length },
    { key: 'suppliers', label: 'Suppliers', count: suppliers.length },
    { key: 'admins', label: 'Admins', count: admins.length }
  ]

  // Refresh data on mount
  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <AdminAuthGuard>
      <ModernSubpageLayout
        title="User Management"
        subtitle="Manage users, suppliers, and admin accounts"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users' }
        ]}
        showAddButton
        addButtonText="Create Admin"
        onAddClick={handleAddUser}
        showExportButton
        onExportClick={handleExport}
        headerActions={
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
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
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>{userStats.newUsersThisMonth} new this month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.activeUsers.toLocaleString()}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+{userStats.activeUsersGrowth}% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
                <Store className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-purple-600">
                <Grid3X3 className="h-4 w-4 mr-1" />
                <span>{userStats.pendingSuppliers} pending approval</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Last login today</span>
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
            activeFilters={userFilters}
            onFilterChange={handleFilterChange}
          />

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Growth Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder - User growth over time</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.uid} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || user.email}</p>
                          <p className="text-gray-500">{user.role} • {user.status}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      {selectedUsers.length} user(s) selected
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('activate')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleBulkAction('suspend')}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                      >
                        Suspend
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

              {/* Users DataTable */}
              <DataTable
                data={filteredUsers}
                columns={[
                  {
                    key: 'name',
                    label: 'User',
                    render: (value: string, user: any) => (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'role',
                    label: 'Role',
                    render: (role: string) => (
                      <StatusBadge
                        status={role}
                        variant="pill"
                      />
                    )
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (status: string) => (
                      <StatusBadge
                        status={status}
                        variant="dot"
                      />
                    )
                  },
                  {
                    key: 'createdAt',
                    label: 'Joined',
                    render: (date: string) => new Date(date).toLocaleDateString()
                  }
                ]}
                actions={[
                  {
                    key: 'view',
                    label: 'View',
                    icon: Eye,
                    onClick: (user: any) => router.push(`/admin/users/${user.uid}`)
                  },
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: Edit,
                    onClick: (user: any) => router.push(`/admin/users/${user.uid}/edit`)
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: Trash2,
                    onClick: (user: any) => {
                      deleteUser(user.uid, 'admin-1', 'User deletion')
                      success('User deleted successfully')
                    }
                  }
                ]}
              />
            </div>
          )}
        </div>

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Admin</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Admin name"
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="admin@nubiago.com"
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAdmin(false)
                      setFormData({ name: '', email: '', role: 'admin' })
                      setFormErrors({})
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{isSubmitting ? 'Creating...' : 'Create Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </ModernSubpageLayout>
    </AdminAuthGuard>
  )
}
