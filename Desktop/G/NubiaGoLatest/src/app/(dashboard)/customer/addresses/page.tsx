'use client'

import { useState } from 'react'
import { Plus, MapPin, Edit, Trash2, Home, Building, Star } from 'lucide-react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'Home Address',
      street: '123 Main Street',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34000',
      country: 'Turkey',
      isDefault: true
    },
    {
      id: '2',
      type: 'work',
      name: 'Office Address',
      street: '456 Business Ave',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34100',
      country: 'Turkey',
      isDefault: false
    },
    {
      id: '3',
      type: 'other',
      name: 'Parents House',
      street: '789 Family Road',
      city: 'Ankara',
      state: 'Ankara',
      zipCode: '06000',
      country: 'Turkey',
      isDefault: false
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id))
    }
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return Home
      case 'work': return Building
      default: return MapPin
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Address Name',
      sortable: true,
      render: (value: string, row: Address) => {
        const IconComponent = getAddressIcon(row.type)
        return (
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${row.isDefault ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <IconComponent className={`h-4 w-4 ${row.isDefault ? 'text-primary-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className="font-medium text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 capitalize">{row.type}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'street',
      label: 'Address',
      render: (value: string, row: Address) => (
        <div>
          <div className="text-sm text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {row.city}, {row.state} {row.zipCode}
          </div>
          <div className="text-sm text-gray-500">{row.country}</div>
        </div>
      )
    },
    {
      key: 'isDefault',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        value ? (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            <Star className="h-3 w-3 mr-1" />
            Default
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    }
  ]

  const actions = [
    {
      key: 'edit',
      label: 'Edit Address',
      icon: Edit,
      onClick: (address: Address) => setEditingAddress(address)
    },
    {
      key: 'setDefault',
      label: 'Set as Default',
      icon: Star,
      onClick: (address: Address) => handleSetDefault(address.id)
    },
    {
      key: 'delete',
      label: 'Delete Address',
      icon: Trash2,
      onClick: (address: Address) => handleDeleteAddress(address.id),
      variant: 'danger' as const
    }
  ]

  const emptyState = (
    <div className="text-center py-12">
      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Add your first address to get started with deliveries
      </p>
      <div className="mt-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </button>
      </div>
    </div>
  )

  return (
    <ModernSubpageLayout
      title="Addresses"
      subtitle="Manage your delivery and billing addresses"
      backUrl="/customer"
      showAddButton
      addButtonText="Add Address"
      onAddClick={() => setShowAddForm(true)}
      breadcrumbs={[
        { label: 'Dashboard', href: '/customer' },
        { label: 'Addresses' }
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Addresses</p>
                <p className="text-2xl font-semibold text-gray-900">{addresses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Default Address</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {addresses.find(a => a.isDefault)?.name || 'None'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Address Types</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(addresses.map(a => a.type)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Table */}
        <DataTable
          columns={columns}
          data={addresses}
          actions={actions}
          emptyState={emptyState}
        />

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingAddress) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <form 
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const addressData = {
                    name: formData.get('name') as string,
                    street: formData.get('street') as string,
                    city: formData.get('city') as string,
                    zipCode: formData.get('zipCode') as string,
                    type: formData.get('type') as 'home' | 'work' | 'other',
                    isDefault: formData.get('isDefault') === 'on'
                  }
                  
                  if (editingAddress) {
                    // Update existing address
                    setAddresses(prev => prev.map(addr => 
                      addr.id === editingAddress.id 
                        ? { ...addr, ...addressData, state: 'Istanbul', country: 'Turkey' }
                        : addr
                    ))
                  } else {
                    // Add new address
                    const newAddress = {
                      id: Date.now().toString(),
                      ...addressData,
                      state: 'Istanbul',
                      country: 'Turkey'
                    }
                    setAddresses(prev => [...prev, newAddress])
                  }
                  
                  setShowAddForm(false)
                  setEditingAddress(null)
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Home, Office"
                    defaultValue={editingAddress?.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    name="street"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="123 Main Street"
                    defaultValue={editingAddress?.street}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Istanbul"
                      defaultValue={editingAddress?.city}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      name="zipCode"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="34000"
                      defaultValue={editingAddress?.zipCode}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Type
                  </label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    defaultValue={editingAddress?.type || 'home'}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    name="isDefault"
                    type="checkbox"
                    id="isDefault"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked={editingAddress?.isDefault}
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingAddress(null)
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Add'} Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModernSubpageLayout>
  )
}
