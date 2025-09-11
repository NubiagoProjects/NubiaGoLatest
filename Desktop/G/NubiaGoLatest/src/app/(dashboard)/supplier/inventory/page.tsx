'use client'

import { useState } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Plus,
  Edit,
  Eye
} from 'lucide-react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

export default function SupplierInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const inventoryItems = [
    {
      id: '1',
      name: 'Wireless Headphones',
      sku: 'WH-001',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 25.00,
      totalValue: 1125.00,
      status: 'in_stock',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Smart Watch',
      sku: 'SW-002',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 150.00,
      totalValue: 1200.00,
      status: 'low_stock',
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      sku: 'BS-003',
      currentStock: 0,
      minStock: 10,
      maxStock: 30,
      unitCost: 45.00,
      totalValue: 0.00,
      status: 'out_of_stock',
      lastUpdated: '2024-01-13'
    },
    {
      id: '4',
      name: 'USB-C Cable',
      sku: 'UC-004',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unitCost: 8.00,
      totalValue: 1200.00,
      status: 'in_stock',
      lastUpdated: '2024-01-15'
    }
  ]

  const getInventoryStatus = (status: string) => {
    switch (status) {
      case 'in_stock': return 'active'
      case 'low_stock': return 'pending'
      case 'out_of_stock': return 'inactive'
      default: return 'draft'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <TrendingUp className="h-4 w-4" />
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock': return <TrendingDown className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock').length
  const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length

  const handleAddItem = () => {
    console.log('Adding new inventory item...')
    // TODO: Implement add item functionality
  }

  const handleExport = () => {
    console.log('Exporting inventory data...')
    // TODO: Implement export functionality
  }

  return (
    <ModernSubpageLayout
      title="Inventory Management"
      subtitle="Track and manage your product inventory"
      breadcrumbs={[
        { label: 'Supplier Dashboard', href: '/supplier' },
        { label: 'Inventory', href: '/supplier/inventory' }
      ]}
      showAddButton
      addButtonText="Add Item"
      onAddClick={handleAddItem}
      showExportButton
      onExportClick={handleExport}
    >

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockItems}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name or SKU..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' }
            ]
          }
        ]}
        activeFilters={{ status: filterStatus }}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            setFilterStatus(value)
          }
        }}
      />

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.currentStock} / {item.maxStock}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {item.minStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusBadge status={getInventoryStatus(item.status)} />
                      {getStatusIcon(item.status)}
                      <span className="ml-2 text-xs text-gray-500 capitalize">{item.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₦{item.totalValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₦{item.unitCost.toFixed(2)} each
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
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

      {/* Low Stock Alerts */}
      {lowStockItems > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {lowStockItems} item{lowStockItems > 1 ? 's' : ''} running low on stock. Consider restocking soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first inventory item'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={handleAddItem}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Add Item
            </button>
          )}
        </div>
      )}
    </ModernSubpageLayout>
  )
}
