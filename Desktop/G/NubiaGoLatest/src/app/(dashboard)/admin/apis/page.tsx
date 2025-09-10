'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Settings, TestTube, Eye, Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle, Clock, 
  ExternalLink, Copy, Save, Loader2, Search,
  Filter, MoreHorizontal, RefreshCw, Zap,
  Truck, CreditCard, Mail, BarChart3, Database,
  Globe, Shield, Key, Link, Activity
} from 'lucide-react'
import { ApiConfiguration, ApiProvider, ApiTestResult } from '@/types'
import { generateId } from '@/lib/utils';

type ApiStatus = 'active' | 'inactive' | 'testing';

interface ApiFormData {
  id?: string;
  name: string;
  description: string;
  type: 'logistics' | 'payment' | 'communication' | 'analytics' | 'storage' | 'other';
  provider?: string;
  apiKey?: string;
  apiSecret?: string;
  baseUrl: string;
  webhookUrl?: string;
  headers?: Record<string, string>;
  status: ApiStatus;
  authentication?: {
    type: 'api-key' | 'bearer' | 'oauth2' | 'none';
    token?: string;
    clientId?: string;
    clientSecret?: string;
  };
  endpoints?: Array<{
    id: string;
    name: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TestResult extends Omit<ApiTestResult, 'success'> {
  success?: boolean; 
  [key: string]: any; 
}

const API_PROVIDERS: ApiProvider[] = [
  // Logistics APIs
  {
    id: 'fedex',
    name: 'FedEx',
    type: 'logistics',
    description: 'Shipping and logistics services',
    website: 'https://www.fedex.com',
    documentation: 'https://developer.fedex.com',
    features: ['Shipping rates', 'Tracking', 'Label generation'],
    pricing: 'Pay per use',
    isPopular: true
  },
  {
    id: 'ups',
    name: 'UPS',
    type: 'logistics',
    description: 'United Parcel Service shipping',
    website: 'https://www.ups.com',
    documentation: 'https://developer.ups.com',
    features: ['Shipping rates', 'Tracking', 'Label generation'],
    pricing: 'Pay per use'
  },
  {
    id: 'dhl',
    name: 'DHL',
    type: 'logistics',
    description: 'International shipping services',
    website: 'https://www.dhl.com',
    documentation: 'https://developer.dhl.com',
    features: ['International shipping', 'Tracking', 'Customs'],
    pricing: 'Pay per use'
  },
  {
    id: 'bagster',
    name: 'Bagster',
    type: 'logistics',
    description: 'Waste removal and dumpster services',
    website: 'https://www.bagster.com',
    documentation: 'https://developer.bagster.com',
    features: ['Waste removal', 'Dumpster services', 'Scheduling', 'Pricing'],
    pricing: 'Pay per bag or service',
    isPopular: false
  },
  // Payment APIs
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment',
    description: 'Payment processing platform',
    website: 'https://stripe.com',
    documentation: 'https://stripe.com/docs',
    features: ['Credit cards', 'Digital wallets', 'Subscriptions'],
    pricing: '2.9% + 30¢ per transaction',
    isPopular: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'payment',
    description: 'Digital payment platform',
    website: 'https://www.paypal.com',
    documentation: 'https://developer.paypal.com',
    features: ['PayPal checkout', 'Venmo', 'Credit cards'],
    pricing: '2.9% + fixed fee'
  },
  {
    id: 'square',
    name: 'Square',
    type: 'payment',
    description: 'Payment and point-of-sale solutions',
    website: 'https://squareup.com',
    documentation: 'https://developer.squareup.com',
    features: ['In-person payments', 'Online payments', 'Invoicing'],
    pricing: '2.6% + 10¢ per transaction'
  },
  // Communication APIs
  {
    id: 'sendgrid',
    name: 'SendGrid',
    type: 'communication',
    description: 'Email delivery service',
    website: 'https://sendgrid.com',
    documentation: 'https://docs.sendgrid.com',
    features: ['Transactional emails', 'Marketing emails', 'Email templates'],
    pricing: 'Free tier available',
    isPopular: true
  },
  {
    id: 'twilio',
    name: 'Twilio',
    type: 'communication',
    description: 'Communication platform for SMS and voice',
    website: 'https://www.twilio.com',
    documentation: 'https://www.twilio.com/docs',
    features: ['SMS', 'Voice calls', 'WhatsApp'],
    pricing: 'Pay per use'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    type: 'communication',
    description: 'Email marketing platform',
    website: 'https://mailchimp.com',
    documentation: 'https://mailchimp.com/developer',
    features: ['Email campaigns', 'Automation', 'Analytics'],
    pricing: 'Free tier available'
  },
  // Analytics APIs
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    type: 'analytics',
    description: 'Web analytics service',
    website: 'https://analytics.google.com',
    documentation: 'https://developers.google.com/analytics',
    features: ['Page tracking', 'User behavior', 'Conversion tracking'],
    pricing: 'Free tier available',
    isPopular: true
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    type: 'analytics',
    description: 'Product analytics platform',
    website: 'https://mixpanel.com',
    documentation: 'https://developer.mixpanel.com',
    features: ['Event tracking', 'Funnel analysis', 'A/B testing'],
    pricing: 'Free tier available'
  }
]

const initialFormData: ApiFormData = {
  name: '',
  description: '',
  type: 'logistics',
  provider: '',
  baseUrl: '',
  status: 'inactive',
  apiKey: '',
  apiSecret: '',
  headers: {},
  authentication: { type: 'api-key' },
  endpoints: []
};

export default function ApiManagementPage() {
  const router = useRouter()
  const [apis, setApis] = useState<ApiConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedApi, setSelectedApi] = useState<ApiConfiguration | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ApiFormData>(initialFormData)

  // Load API configurations
  const loadApis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/apis')
      const result = await response.json()
      
      if (result.success) {
        setApis(result.data)
      } else {
        setError(result.error || 'Failed to load API configurations')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load API configurations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApis()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const apiId = formData.id || generateId();
      
      const apiData: ApiConfiguration = {
        ...formData,
        id: apiId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        provider: formData.provider?.trim() || '',
        apiKey: formData.apiKey?.trim() || undefined,
        apiSecret: formData.apiSecret?.trim() || undefined,
        baseUrl: formData.baseUrl.trim(),
        webhookUrl: formData.webhookUrl?.trim(),
        status: formData.status,
        authentication: formData.authentication || { type: 'api-key' },
        endpoints: formData.endpoints || [],
        createdAt: formData.createdAt || new Date(),
        updatedAt: new Date(),
        isActive: formData.status === 'active',
        isTestMode: false,
        lastTested: new Date()
      };

      const url = formData.id ? `/api/apis/${formData.id}` : '/api/apis'
      const method = formData.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()
      
      if (result.success) {
        await loadApis()
        setShowAddModal(false)
        setShowEditModal(false)
        setFormData(initialFormData)
      } else {
        setError(result.error || 'Failed to save API configuration')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save API configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleAddApi = () => {
    setFormData(initialFormData)
    setShowAddModal(true)
  }

  const handleEditApi = (api: ApiConfiguration) => {
    setSelectedApi(api)
    setFormData({
      id: api.id,
      name: api.name,
      description: api.description || '',
      type: api.type,
      provider: api.provider || '',
      apiKey: api.apiKey || '',
      apiSecret: api.apiSecret || '',
      baseUrl: api.baseUrl,
      webhookUrl: api.webhookUrl,
      headers: api.headers || {},
      status: api.status,
      authentication: api.authentication || { type: 'api-key' },
      endpoints: api.endpoints || [],
      createdAt: api.createdAt,
      updatedAt: api.updatedAt
    })
    setShowEditModal(true)
  }

  const testApi = async (api: ApiConfiguration) => {
    setTesting(true)
    setSelectedApi(api)
    setTestResults([])
    
    try {
      const response = await fetch(`/api/apis/${api.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        setApis(prevApis => 
          prevApis.map(a => 
            a.id === api.id 
              ? { 
                  ...a,
                  status: result.data.success ? 'active' : 'inactive',
                  updatedAt: new Date()
                } 
              : a
          )
        )
        
        const testResult: TestResult = {
          ...result.data,
          id: Date.now().toString(),
          apiId: api.id,
          timestamp: new Date(),
          status: result.data.success ? 'success' : 'failed',
          responseTime: result.data.responseTime || 0,
          statusCode: result.data.statusCode,
          responseBody: result.data.responseBody,
          error: result.data.error,
          requestHeaders: result.data.requestHeaders,
          requestBody: result.data.requestBody
        };
        
        setTestResults(prev => [...prev, testResult])
      } else {
        setError(result.error || 'Failed to test API')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to test API')
    } finally {
      setTesting(false)
    }
  }

  const handleTestApi = (api: ApiConfiguration) => {
    setSelectedApi(api)
    setTestResults([])
    setShowTestModal(true)
  }

  const handleDeleteApi = async (apiId: string) => {
    if (!confirm('Are you sure you want to delete this API configuration?')) {
      return
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/apis/${apiId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await loadApis() // Reload the list
      } else {
        setError(result.error || 'Failed to delete API configuration')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete API configuration')
    }
  }

  const getStatusBadge = (status?: ApiStatus) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    switch (status) {
      case 'active':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </span>
        )
      case 'testing':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Testing
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </span>
        )
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logistics': return <Truck className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'communication': return <Mail className="h-4 w-4" />
      case 'analytics': return <BarChart3 className="h-4 w-4" />
      case 'storage': return <Database className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'inactive': return <XCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'testing': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredApis = apis.filter(api => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = api.name.toLowerCase().includes(searchLower) ||
                        (api.provider?.toLowerCase() || '').includes(searchLower);
    const matchesType = filterType === 'all' || api.type === filterType;
    const matchesStatus = filterStatus === 'all' || api.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
              <p className="text-gray-600">Manage your third-party API integrations</p>
            </div>
            <button
              onClick={handleAddApi}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search APIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="logistics">Logistics</option>
                <option value="payment">Payment</option>
                <option value="communication">Communication</option>
                <option value="analytics">Analytics</option>
                <option value="storage">Storage</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map((api) => (
            <div key={api.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      {getTypeIcon(api.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{api.name}</h3>
                      <p className="text-sm text-gray-600">{api.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                      {getStatusIcon(api.status)}
                      <span className="ml-1">{api.status}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{api.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mode:</span>
                    <span className={`font-medium ${api.isTestMode ? 'text-yellow-600' : 'text-green-600'}`}>
                      {api.isTestMode ? 'Test' : 'Live'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Tested:</span>
                    <span className="font-medium">
                      {api.lastTested ? new Date(api.lastTested).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditApi(api)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit API"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleTestApi(api)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Test API"
                    >
                      <TestTube className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteApi(api.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete API"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      api.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-xs text-gray-500">
                      {api.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApis.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No APIs found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first API integration'
              }
            </p>
            {!searchQuery && filterType === 'all' && filterStatus === 'all' && (
              <button
                onClick={handleAddApi}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First API</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {showEditModal ? 'Edit API Configuration' : 'Add New API'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedApi(null)
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., FedEx Shipping API"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="logistics">Logistics</option>
                    <option value="payment">Payment</option>
                    <option value="communication">Communication</option>
                    <option value="analytics">Analytics</option>
                    <option value="storage">Storage</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a provider</option>
                  {API_PROVIDERS.filter(provider => provider.type === formData.type).map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter API secret"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://api.nubiago.com/webhooks/..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.status === 'active'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedApi(null)
                  setError(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {showEditModal ? 'Update API' : 'Add API'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && selectedApi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Test API Connection</h3>
              <button
                onClick={() => {
                  setShowTestModal(false)
                  setSelectedApi(null)
                  setTestResults([])
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  {getTypeIcon(selectedApi.type)}
                  <div>
                    <h4 className="font-semibold">{selectedApi.name}</h4>
                    <p className="text-sm text-gray-600">{selectedApi.provider}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium capitalize">{selectedApi.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 font-medium ${getStatusColor(selectedApi.status)}`}>
                      {selectedApi.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <button
                onClick={() => testApi(selectedApi)}
                disabled={testing}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {testResults.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Test Results</h4>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            result.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {result.message}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.responseTime && `${result.responseTime}ms`}
                        </div>
                      </div>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-2">{result.error}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {result.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
