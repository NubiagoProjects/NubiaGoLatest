'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Store,
  Package,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Tag,
  Shield,
  Zap
} from 'lucide-react'

interface ApprovalItem {
  id: string
  type: 'supplier' | 'product' | 'content' | 'withdrawal' | 'refund'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedBy: string
  submittedDate: string
  reviewedBy?: string
  reviewedDate?: string
  notes?: string
  tags: string[]
  estimatedValue?: number
  riskLevel: 'low' | 'medium' | 'high'
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([])
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  // Mock data
  useEffect(() => {
    const mockApprovals: ApprovalItem[] = [
      {
        id: '1',
        type: 'supplier',
        title: 'New Supplier Registration - TechCorp Solutions',
        description: 'Application for new electronics supplier with 15+ years experience in consumer electronics distribution.',
        status: 'pending',
        priority: 'high',
        submittedBy: 'John Smith',
        submittedDate: '2024-01-15',
        tags: ['electronics', 'supplier', 'new'],
        estimatedValue: 50000,
        riskLevel: 'medium'
      },
      {
        id: '2',
        type: 'product',
        title: 'Product Launch - Premium Wireless Headphones',
        description: 'High-end wireless headphones with noise cancellation technology. Market analysis shows strong demand.',
        status: 'under_review',
        priority: 'urgent',
        submittedBy: 'Sarah Johnson',
        submittedDate: '2024-01-14',
        reviewedBy: 'Mike Wilson',
        reviewedDate: '2024-01-15',
        notes: 'Need additional safety certifications before approval.',
        tags: ['audio', 'wireless', 'premium'],
        estimatedValue: 25000,
        riskLevel: 'low'
      },
      {
        id: '3',
        type: 'content',
        title: 'Marketing Campaign - Summer Sale Promotion',
        description: 'Multi-channel marketing campaign for summer sale with 30% discount on selected items.',
        status: 'approved',
        priority: 'medium',
        submittedBy: 'Emily Davis',
        submittedDate: '2024-01-13',
        reviewedBy: 'Admin User',
        reviewedDate: '2024-01-14',
        notes: 'Approved with minor copy edits. Campaign scheduled for July.',
        tags: ['marketing', 'promotion', 'summer'],
        estimatedValue: 15000,
        riskLevel: 'low'
      },
      {
        id: '4',
        type: 'withdrawal',
        title: 'Large Fund Withdrawal Request',
        description: 'Supplier requesting withdrawal of $45,000 for completed bulk order payment.',
        status: 'pending',
        priority: 'urgent',
        submittedBy: 'Robert Chen',
        submittedDate: '2024-01-15',
        tags: ['finance', 'withdrawal', 'bulk-order'],
        estimatedValue: 45000,
        riskLevel: 'high'
      },
      {
        id: '5',
        type: 'refund',
        title: 'Customer Refund - Defective Product',
        description: 'Customer requesting full refund for defective smartphone. Product returned and verified.',
        status: 'pending',
        priority: 'medium',
        submittedBy: 'Lisa Wang',
        submittedDate: '2024-01-14',
        tags: ['refund', 'customer-service', 'defective'],
        estimatedValue: 800,
        riskLevel: 'low'
      },
      {
        id: '6',
        type: 'supplier',
        title: 'Supplier Contract Renewal - Fashion Forward',
        description: 'Annual contract renewal for clothing supplier. Performance metrics show 95% satisfaction rate.',
        status: 'pending',
        priority: 'medium',
        submittedBy: 'David Brown',
        submittedDate: '2024-01-12',
        tags: ['clothing', 'renewal', 'contract'],
        estimatedValue: 75000,
        riskLevel: 'low'
      }
    ]

    setTimeout(() => {
      setApprovals(mockApprovals)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterToggle = () => {
    setShowFilterDropdown(!showFilterDropdown)
  }

  const handleApprovalSelection = (approvalId: string, checked: boolean) => {
    if (checked) {
      setSelectedApprovals([...selectedApprovals, approvalId])
    } else {
      setSelectedApprovals(selectedApprovals.filter(id => id !== approvalId))
    }
  }

  const handleSelectAllApprovals = (checked: boolean) => {
    if (checked) {
      setSelectedApprovals(approvals.map(item => item.id))
    } else {
      setSelectedApprovals([])
    }
  }

  const handleApprovalAction = (action: string, approvalId: string) => {
    switch (action) {
      case 'review':
        setShowReviewModal(approvalId)
        break
      case 'approve':
        setApprovals(approvals.map(item => 
          item.id === approvalId ? { ...item, status: 'approved' as const } : item
        ))
        break
      case 'reject':
        setApprovals(approvals.map(item => 
          item.id === approvalId ? { ...item, status: 'rejected' as const } : item
        ))
        break
      case 'under_review':
        setApprovals(approvals.map(item => 
          item.id === approvalId ? { ...item, status: 'under_review' as const } : item
        ))
        break
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'approve':
        setApprovals(approvals.map(item => 
          selectedApprovals.includes(item.id) ? { ...item, status: 'approved' as const } : item
        ))
        break
      case 'reject':
        setApprovals(approvals.map(item => 
          selectedApprovals.includes(item.id) ? { ...item, status: 'rejected' as const } : item
        ))
        break
      case 'under_review':
        setApprovals(approvals.map(item => 
          selectedApprovals.includes(item.id) ? { ...item, status: 'under_review' as const } : item
        ))
        break
    }
    setSelectedApprovals([])
  }

  const handleReviewSubmit = () => {
    if (showReviewModal && reviewAction) {
      setApprovals(approvals.map(item => 
        item.id === showReviewModal ? { 
          ...item, 
          status: reviewAction === 'approve' ? 'approved' : 'rejected' as const,
          reviewedBy: 'Admin User',
          reviewedDate: new Date().toISOString().split('T')[0],
          notes: reviewNotes
        } : item
      ))
      setShowReviewModal(null)
      setReviewNotes('')
      setReviewAction(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return <Store className="h-5 w-5" />
      case 'product':
        return <Package className="h-5 w-5" />
      case 'content':
        return <FileText className="h-5 w-5" />
      case 'withdrawal':
        return <TrendingUp className="h-5 w-5" />
      case 'refund':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         approval.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         approval.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || approval.type === filterType
    const matchesStatus = filterStatus === 'all' || approval.status === filterStatus
    const matchesPriority = filterPriority === 'all' || approval.priority === filterPriority
    return matchesSearch && matchesType && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approval System</h1>
          <p className="text-gray-600">Review and manage all pending approvals, supplier registrations, and content submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(item => item.status === 'under_review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(item => item.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(item => item.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search approvals..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <button 
                  onClick={handleFilterToggle}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Type</div>
                    <button
                      onClick={() => { setFilterType('all'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      All Types
                    </button>
                    {['supplier', 'product', 'content', 'withdrawal', 'refund'].map(type => (
                      <button
                        key={type}
                        onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize"
                      >
                        {type}
                      </button>
                    ))}
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase mt-2">Status</div>
                    <button
                      onClick={() => { setFilterStatus('all'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      All Status
                    </button>
                    {['pending', 'under_review', 'approved', 'rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize"
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase mt-2">Priority</div>
                    <button
                      onClick={() => { setFilterPriority('all'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      All Priorities
                    </button>
                    {['urgent', 'high', 'medium', 'low'].map(priority => (
                      <button
                        key={priority}
                        onClick={() => { setFilterPriority(priority); setShowFilterDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize"
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {selectedApprovals.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedApprovals.length} selected</span>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => handleBulkAction('under_review')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Mark Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Approvals Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Approval Requests ({filteredApprovals.length})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing {filteredApprovals.length} of {approvals.length}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedApprovals.length === approvals.length && approvals.length > 0}
                      onChange={(e) => handleSelectAllApprovals(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk/Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedApprovals.includes(approval.id)}
                        onChange={(e) => handleApprovalSelection(approval.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(approval.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{approval.type}</p>
                          <p className="text-xs text-gray-500">#{approval.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 mb-1">{approval.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{approval.description}</p>
                        <div className="flex items-center mt-2">
                          <User className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{approval.submittedBy}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{approval.submittedDate}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {approval.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                        {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          approval.status === 'approved' ? 'bg-green-500' :
                          approval.status === 'rejected' ? 'bg-red-500' :
                          approval.status === 'pending' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        {approval.status.replace('_', ' ').charAt(0).toUpperCase() + approval.status.replace('_', ' ').slice(1)}
                      </span>
                      {approval.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          by {approval.reviewedBy} on {approval.reviewedDate}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {approval.estimatedValue && (
                          <p className="text-gray-900 font-medium">${approval.estimatedValue.toLocaleString()}</p>
                        )}
                        <p className={`text-xs font-medium ${getRiskColor(approval.riskLevel)}`}>
                          <Shield className="h-3 w-3 inline mr-1" />
                          {approval.riskLevel.charAt(0).toUpperCase() + approval.riskLevel.slice(1)} Risk
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {approval.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprovalAction('approve', approval.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleApprovalAction('reject', approval.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleApprovalAction('under_review', approval.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Mark for Review"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {approval.status === 'under_review' && (
                          <button 
                            onClick={() => setShowReviewModal(approval.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Review"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {/* View details */}}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Review Approval</h3>
              <button onClick={() => setShowReviewModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setReviewAction('approve')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                      reviewAction === 'approve' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setReviewAction('reject')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                      reviewAction === 'reject' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add review notes..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowReviewModal(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={!reviewAction}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
