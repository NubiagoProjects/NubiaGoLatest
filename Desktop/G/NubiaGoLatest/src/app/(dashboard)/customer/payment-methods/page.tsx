'use client'

import { useState } from 'react'
import { 
  CreditCard, Plus, Edit, Trash2, Shield, CheckCircle, AlertCircle, Star, Smartphone
} from 'lucide-react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface PaymentMethod {
  id: string
  type: 'mobile_money' | 'card'
  name: string
  number: string
  isDefault: boolean
  isActive: boolean
  expiryDate?: string
  provider?: string
}

export default function CustomerPaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mobile_money',
      name: 'Mobile Money',
      number: '+233 24 123 4567',
      isDefault: true,
      isActive: true,
      provider: 'MTN'
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa ending in 1234',
      number: '**** **** **** 1234',
      isDefault: false,
      isActive: true,
      expiryDate: '12/25',
      provider: 'Visa'
    },
    {
      id: '3',
      type: 'card',
      name: 'Mastercard ending in 5678',
      number: '**** **** **** 5678',
      isDefault: false,
      isActive: false,
      expiryDate: '08/24',
      provider: 'Mastercard'
    }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<string | null>(null)

  const setDefaultMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
  }

  const deleteMethod = (id: string) => {
    if (paymentMethods.find(m => m.id === id)?.isDefault) {
      console.log('Cannot delete default payment method')
      return
    }
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'mobile_money': return Smartphone
      case 'card': return CreditCard
      default: return CreditCard
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Payment Method',
      sortable: true,
      render: (value: string, row: PaymentMethod) => {
        const IconComponent = getPaymentIcon(row.type)
        return (
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${row.isDefault ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <IconComponent className={`h-4 w-4 ${row.isDefault ? 'text-primary-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className="font-medium text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 capitalize">{row.type.replace('_', ' ')}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'number',
      label: 'Details',
      render: (value: string, row: PaymentMethod) => (
        <div>
          <div className="text-sm text-gray-900 font-mono">{value}</div>
          {row.provider && (
            <div className="text-sm text-gray-500">{row.provider}</div>
          )}
          {row.expiryDate && (
            <div className="text-sm text-gray-500">Expires {row.expiryDate}</div>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: boolean, row: PaymentMethod) => (
        <div className="space-y-1">
          <StatusBadge status={value ? 'active' : 'inactive'} />
          {row.isDefault && (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              <Star className="h-3 w-3 mr-1" />
              Default
            </div>
          )}
        </div>
      )
    }
  ]

  const actions = [
    {
      key: 'edit',
      label: 'Edit Method',
      icon: Edit,
      onClick: (method: PaymentMethod) => setEditingMethod(method.id)
    },
    {
      key: 'setDefault',
      label: 'Set as Default',
      icon: Star,
      onClick: (method: PaymentMethod) => setDefaultMethod(method.id)
    },
    {
      key: 'delete',
      label: 'Delete Method',
      icon: Trash2,
      onClick: (method: PaymentMethod) => deleteMethod(method.id),
      variant: 'danger' as const
    }
  ]

  const emptyState = (
    <div className="text-center py-12">
      <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
      <p className="mt-1 text-sm text-gray-500">
        Add a payment method to speed up your checkout process.
      </p>
      <div className="mt-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </button>
      </div>
    </div>
  )

  return (
    <ModernSubpageLayout
      title="Payment Methods"
      subtitle="Manage your payment methods for faster checkout"
      backUrl="/customer"
      showAddButton
      addButtonText="Add Payment Method"
      onAddClick={() => setShowAddForm(true)}
      breadcrumbs={[
        { label: 'Dashboard', href: '/customer' },
        { label: 'Payment Methods' }
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Methods</p>
                <p className="text-2xl font-semibold text-gray-900">{paymentMethods.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {paymentMethods.filter(m => m.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Default Method</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {paymentMethods.find(m => m.isDefault)?.provider || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Table */}
        <DataTable
          columns={columns}
          data={paymentMethods}
          actions={actions}
          emptyState={emptyState}
        />

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Security</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and stored securely. We never store your 
                full card details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Add Payment Method Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h3>
                <form 
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const paymentData = {
                      type: formData.get('type') as 'mobile_money' | 'card',
                      number: formData.get('number') as string,
                      isDefault: formData.get('isDefault') === 'on'
                    }
                    
                    const newPaymentMethod = {
                      id: Date.now().toString(),
                      name: paymentData.type === 'mobile_money' ? 'Mobile Money' : 'Credit Card',
                      number: paymentData.number,
                      type: paymentData.type,
                      isDefault: paymentData.isDefault,
                      isActive: true,
                      provider: paymentData.type === 'mobile_money' ? 'MTN' : 'Visa'
                    }
                    
                    // If setting as default, update other methods
                    if (paymentData.isDefault) {
                      setPaymentMethods(prev => prev.map(method => ({
                        ...method,
                        isDefault: false
                      })))
                    }
                    
                    setPaymentMethods(prev => [...prev, newPaymentMethod])
                    setShowAddForm(false)
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <select 
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      name="number"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      name="isDefault"
                      id="setAsDefault"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="setAsDefault" className="ml-2 block text-sm text-gray-700">
                      Set as default payment method
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Add Payment Method
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernSubpageLayout>
  )
} 
