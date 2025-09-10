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
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [showSupplierDetails, setShowSupplierDetails] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Get data from admin dashboard store
  const {
    users,
    userStats,
    loading,
    fetchUsers,
    updateUserRole,
    bulkUpdateUsers,
    deleteUser,
    userFilters,
    setUserFilters
  } = useAdminDashboardStore()

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.uid.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  // Filter suppliers from users
  const suppliers = users.filter(user => user.role === 'supplier').map(user => ({
    uid: user.uid,
    businessName: user.name || user.email,
    businessType: 'retail', // Default value - should be stored in user profile
    phoneNumber: user.phoneNumber || '',
    documentUrls: [], // Should be stored in user profile
    approvalStatus: user.status === 'active' ? 'approved' : 'pending',
    submittedAt: user.createdAt || new Date(),
    approvedAt: user.status === 'active' ? user.updatedAt : undefined,
    approvedBy: undefined
  }))

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Update filters when they change
  useEffect(() => {
    setUserFilters({
      ...userFilters,
      status: statusFilter === 'all' ? undefined : statusFilter as 'pending' | 'active' | 'suspended' | undefined,
      role: roleFilter === 'all' ? undefined : roleFilter as 'customer' | 'supplier' | 'admin' | undefined,
      search: searchQuery || undefined
    })
  }, [statusFilter, roleFilter, searchQuery, setUserFilters, userFilters])

  const handleApproveSupplier = async (supplierId: string) => {
    try {
      await updateUserRole(supplierId, 'supplier', 'active', 'admin-1', 'Supplier approved')
      success('Supplier approved successfully')
    } catch (err) {
      error('Failed to approve supplier')
    }
  }

  const handleRejectSupplier = async (supplierId: string) => {
    try {
      await updateUserRole(supplierId, 'supplier', 'suspended', 'admin-1', 'Supplier rejected')
      success('Supplier rejected successfully')
    } catch (err) {
      error('Failed to reject supplier')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return

    try {
      switch (action) {
        case 'activate':
          await bulkUpdateUsers(selectedUsers, { status: 'active' }, 'admin-1', 'Bulk activation')
          success(`${selectedUsers.length} users activated successfully`)
          break
        case 'suspend':
          await bulkUpdateUsers(selectedUsers, { status: 'suspended' }, 'admin-1', 'Bulk suspension')
          success(`${selectedUsers.length} users suspended successfully`)
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            await Promise.all(selectedUsers.map(id => deleteUser(id, 'admin-1', 'Bulk deletion')))
            success(`${selectedUsers.length} users deleted successfully`)
          }
          break
        default:
          break
      }
      setSelectedUsers([])
    } catch (err) {
      error(`Failed to perform bulk ${action} action`)
    }
  }

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.uid))
    } else {
      setSelectedUsers([])
    }
  }

  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
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
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage users, suppliers, and admin accounts</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleThemeToggle}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Admin</span>
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
                  <Activity className="h-4 w-4 mr-1" />
                  <span>{userStats.activeUsers} online</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalSuppliers.toLocaleString()}</p>
                  </div>
                  <Store className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-yellow-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{userStats.pendingUsers} pending approval</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalAdmins.toLocaleString()}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <Settings className="h-4 w-4 mr-1" />
                  <span>System administrators</span>
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
                    { id: 'users', label: 'All Users', icon: Users },
                    { id: 'suppliers', label: 'Suppliers', icon: Store },
                    { id: 'admins', label: 'Admins', icon: Shield }
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
                        <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Create New User</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <Store className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Approve Suppliers</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                        <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Manage Admins</p>
                      </button>
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
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Roles</option>
                          <option value="customer">Customer</option>
                          <option value="supplier">Supplier</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

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

                    {/* Users Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedUsers.length === users.length}
                                onChange={(e) => handleSelectAllUsers(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <tr key={user.uid} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.uid)}
                                  onChange={(e) => handleUserSelection(user.uid, e.target.checked)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  user.role === 'supplier' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role || 'customer'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {user.status || 'pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => router.push(`/admin/users/${user.uid}`)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => router.push(`/admin/users/${user.uid}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this user?')) {
                                        deleteUser(user.uid, 'admin-1', 'User deletion')
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900"
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

                {activeTab === 'suppliers' && (
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
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {suppliers.map((supplier) => (
                            <tr key={supplier.uid} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {supplier.businessName}
                                </div>
                                <div className="text-sm text-gray-500">{supplier.businessType}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {supplier.businessName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{supplier.phoneNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  supplier.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  supplier.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {supplier.approvalStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {supplier.submittedAt.toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {supplier.approvalStatus === 'pending' && (
                                    <>
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
                                    </>
                                  )}
                                  <button
                                    onClick={() => setShowSupplierDetails(supplier.uid)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Eye className="h-4 w-4" />
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

                {activeTab === 'admins' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.filter(user => user.role === 'admin').map((admin) => (
                            <tr key={admin.uid} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-red-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {admin.name || 'Admin User'}
                                    </div>
                                    <div className="text-sm text-gray-500">{admin.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  {admin.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  admin.status === 'active' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {admin.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => router.push(`/admin/users/${admin.uid}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this admin?')) {
                                        deleteUser(admin.uid, 'admin-1', 'Admin deletion')
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
} 
