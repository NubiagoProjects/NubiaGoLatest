'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, ArrowLeft, Plus, Edit, Trash2, Shield,
  CheckCircle, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface PaymentMethod {
  id: string
  type: 'mobile_money' | 'card'
  name: string
  number: string
  isDefault: boolean
  isActive: boolean
}

export default function CustomerPaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mobile_money',
      name: 'Mobile Money',
      number: '+233 24 123 4567',
      isDefault: true,
      isActive: true
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa ending in 1234',
      number: '**** **** **** 1234',
      isDefault: false,
      isActive: true
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
      alert('Cannot delete default payment method')
      return
    }
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'mobile_money': return <CreditCard className="h-5 w-5" />
      case 'card': return <CreditCard className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'mobile_money': return 'text-green-600 bg-green-100'
      case 'card': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/customer" className="text-gray-400 hover:text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600">Manage your payment methods for faster checkout</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Payment Method</span>
          </button>
        </div>

        {/* Payment Methods List */}
        <div className="bg-white rounded-lg shadow">
          {paymentMethods.length === 0 ? (
            <div className="p-8 text-center">
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
          ) : (
            <div className="divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPaymentColor(method.type)}`}>
                        {getPaymentIcon(method.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
                          {method.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                          {!method.isActive && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{method.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultMethod(method.id)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => setEditingMethod(method.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!method.isDefault && (
                        <button
                          onClick={() => deleteMethod(method.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
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

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Methods</p>
                <p className="text-2xl font-semibold text-gray-900">{paymentMethods.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {paymentMethods.filter(m => !m.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
