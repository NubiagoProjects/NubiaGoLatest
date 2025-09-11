'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface Supplier {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  verificationLevel: 'basic' | 'verified' | 'premium'
  businessType: string
  taxId: string
  registrationDate: string
  lastActive: string
  stats: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    averageRating: number
    completionRate: number
  }
  documents: {
    businessLicense: boolean
    taxCertificate: boolean
    bankStatement: boolean
    identityVerification: boolean
  }
  notes?: string
}

export default function AdminSupplierDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [supplier, setSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    // Simulate loading supplier data
    const loadSupplier = async () => {
      setLoading(true)
      
      // Mock supplier data - replace with actual API call
      const mockSupplier: Supplier = {
        id: params.id,
        companyName: 'TechCorp Solutions Ltd.',
        contactName: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        phone: '+62 812 3456 7890',
        website: 'https://techcorp.com',
        address: {
          street: '123 Business District, Suite 456',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          zipCode: '12345',
          country: 'Indonesia'
        },
        status: 'active',
        approvalStatus: 'approved',
        verificationLevel: 'verified',
        businessType: 'Electronics & Technology',
        taxId: 'TAX123456789',
        registrationDate: '2023-06-15T10:30:00Z',
        lastActive: '2024-01-20T15:45:00Z',
        stats: {
          totalProducts: 45,
          totalOrders: 234,
          totalRevenue: 15750000,
          averageRating: 4.7,
          completionRate: 96.5
        },
        documents: {
          businessLicense: true,
          taxCertificate: true,
          bankStatement: true,
          identityVerification: true
        },
        notes: 'Reliable supplier with excellent track record. Premium partner since 2023.'
      }

      setSupplier(mockSupplier)
      setLoading(false)
    }

    loadSupplier()
  }, [params.id])

  const getStatusColor = (status: Supplier['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Supplier['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'inactive':
        return <XCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'suspended':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getVerificationColor = (level: Supplier['verificationLevel']) => {
    switch (level) {
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      case 'verified':
        return 'bg-blue-100 text-blue-800'
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h2>
          <p className="text-gray-600 mb-4">The supplier you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/suppliers')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Suppliers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/suppliers')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supplier Details</h1>
            <p className="text-gray-600">{supplier.companyName}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/admin/suppliers/${supplier.id}/edit`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Supplier
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Status Overview</h3>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(supplier.status)}`}>
              {getStatusIcon(supplier.status)}
              <span className="ml-2 capitalize">{supplier.status}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerificationColor(supplier.verificationLevel)}`}>
              <Shield className="h-4 w-4 mr-1" />
              {supplier.verificationLevel.charAt(0).toUpperCase() + supplier.verificationLevel.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Registration Date</p>
            <p className="font-medium">{new Date(supplier.registrationDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Active</p>
            <p className="font-medium">{new Date(supplier.lastActive).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Business Type</p>
            <p className="font-medium">{supplier.businessType}</p>
          </div>
          <div>
            <p className="text-gray-600">Tax ID</p>
            <p className="font-medium">{supplier.taxId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Products</p>
                <p className="text-lg font-bold text-blue-600">{supplier.stats.totalProducts}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Orders</p>
                <p className="text-lg font-bold text-green-600">{supplier.stats.totalOrders}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Revenue</p>
                <p className="text-lg font-bold text-purple-600">Rp {(supplier.stats.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Rating</p>
                <p className="text-lg font-bold text-yellow-600">{supplier.stats.averageRating}/5</p>
              </div>
            </div>
          </div>

          {/* Document Verification */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Business License</span>
                {supplier.documents.businessLicense ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Tax Certificate</span>
                {supplier.documents.taxCertificate ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Bank Statement</span>
                {supplier.documents.bankStatement ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Identity Verification</span>
                {supplier.documents.identityVerification ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{supplier.notes}</p>
            </div>
          )}
        </div>

        {/* Contact & Address Info */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{supplier.contactName}</p>
                  <p className="text-sm text-gray-600">Contact Person</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600">{supplier.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600">{supplier.phone}</p>
                </div>
              </div>
              {supplier.website && (
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                      {supplier.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="space-y-1 text-sm text-gray-600">
                <p>{supplier.address.street}</p>
                <p>{supplier.address.city}, {supplier.address.state}</p>
                <p>{supplier.address.zipCode}</p>
                <p>{supplier.address.country}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{supplier.stats.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{supplier.stats.averageRating}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-medium">Rp {supplier.stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                View Products
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                View Orders
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                Send Message
              </button>
              {supplier.status === 'active' ? (
                <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm">
                  Suspend Supplier
                </button>
              ) : (
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  Activate Supplier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
