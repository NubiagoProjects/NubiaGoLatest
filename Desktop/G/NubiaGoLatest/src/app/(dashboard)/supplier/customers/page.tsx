'use client'

import { useState } from 'react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { 
  Users, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Eye,
  MessageSquare,
  Download,
  UserPlus
} from 'lucide-react'

export default function SupplierCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filterOptions = [
    {
      key: 'type',
      label: 'Customer Type',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'vip', label: 'VIP' },
        { value: 'regular', label: 'Regular' },
        { value: 'new', label: 'New' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ]

  const customers = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+90 555 123 4567',
      location: 'Istanbul, Turkey',
      joinDate: '2024-01-15',
      totalOrders: 12,
      totalSpent: 2450.00,
      lastOrder: '2024-01-20',
      status: 'active',
      type: 'regular',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+90 555 987 6543',
      location: 'Ankara, Turkey',
      joinDate: '2023-11-20',
      totalOrders: 25,
      totalSpent: 5200.00,
      lastOrder: '2024-01-22',
      status: 'active',
      type: 'vip',
      rating: 4.9
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+90 555 456 7890',
      location: 'Izmir, Turkey',
      joinDate: '2024-01-10',
      totalOrders: 3,
      totalSpent: 450.00,
      lastOrder: '2024-01-18',
      status: 'active',
      type: 'new',
      rating: 4.5
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+90 555 321 0987',
      location: 'Bursa, Turkey',
      joinDate: '2023-08-15',
      totalOrders: 8,
      totalSpent: 1200.00,
      lastOrder: '2023-12-20',
      status: 'inactive',
      type: 'regular',
      rating: 4.2
    }
  ]

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const handleExport = () => {
    console.log('Exporting customer data...')
    // TODO: Implement export functionality
  }

  const handleAddCustomer = () => {
    console.log('Adding new customer...')
    // TODO: Implement add customer functionality
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const typeFilter = activeFilters.type || 'all'
    const statusFilter = activeFilters.status || 'all'
    
    const matchesType = typeFilter === 'all' || customer.type === typeFilter
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const vipCustomers = customers.filter(c => c.type === 'vip').length
  const avgOrderValue = customers.reduce((sum, c) => sum + (c.totalSpent / c.totalOrders), 0) / customers.length

  const breadcrumbs = [
    { label: 'Dashboard', href: '/supplier' },
    { label: 'Customers', href: '/supplier/customers' }
  ]

  return (
    <ModernSubpageLayout
      title="Customer Management"
      subtitle="View and manage your customer relationships"
      breadcrumbs={breadcrumbs}
      showExportButton
      onExportClick={handleExport}
      showAddButton
      addButtonText="Add Customer"
      onAddClick={handleAddCustomer}
      headerActions={
        <button
          onClick={handleAddCustomer}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      }
    >
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VIP Customers</p>
                <p className="text-2xl font-bold text-gray-900">{vipCustomers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₦{avgOrderValue.toFixed(0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search customers by name or email..."
          filters={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Customers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center space-x-2">
                      <StatusBadge
                        status={customer.status}
                        variant="default"
                      />
                      <StatusBadge
                        status={customer.type}
                        variant="pill"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-600">{customer.rating}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{customer.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {customer.joinDate}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{customer.totalOrders}</div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">₦{customer.totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Total Spent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{customer.lastOrder}</div>
                    <div className="text-xs text-gray-600">Last Order</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </ModernSubpageLayout>
  )
}
