'use client'

import { useState } from 'react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DataTable from '@/components/dashboard/DataTable'
import { 
  MessageSquare, 
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Send,
  Paperclip,
  Eye,
  Edit
} from 'lucide-react'

export default function SupplierSupportPage() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: 'all',
    priority: 'all'
  })
  const [showNewTicket, setShowNewTicket] = useState(false)

  const supportTickets = [
    {
      id: 'TICK-001',
      subject: 'Payment processing issue',
      category: 'payments',
      status: 'open',
      priority: 'high',
      created: '2024-01-22',
      lastUpdate: '2024-01-22',
      messages: 3
    },
    {
      id: 'TICK-002',
      subject: 'Product listing not appearing',
      category: 'products',
      status: 'in_progress',
      priority: 'medium',
      created: '2024-01-21',
      lastUpdate: '2024-01-22',
      messages: 5
    },
    {
      id: 'TICK-003',
      subject: 'Shipping rate calculation error',
      category: 'shipping',
      status: 'resolved',
      priority: 'low',
      created: '2024-01-20',
      lastUpdate: '2024-01-21',
      messages: 2
    },
    {
      id: 'TICK-004',
      subject: 'Account verification needed',
      category: 'account',
      status: 'waiting',
      priority: 'high',
      created: '2024-01-19',
      lastUpdate: '2024-01-20',
      messages: 1
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'waiting': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const handleExport = () => {
    console.log('Exporting support tickets...')
    // TODO: Implement export functionality
  }

  const handleNewTicket = () => {
    setShowNewTicket(true)
  }

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = activeFilters.status === 'all' || ticket.status === activeFilters.status
    const matchesPriority = activeFilters.priority === 'all' || ticket.priority === activeFilters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openTickets = supportTickets.filter(t => t.status === 'open').length
  const inProgressTickets = supportTickets.filter(t => t.status === 'in_progress').length
  const resolvedTickets = supportTickets.filter(t => t.status === 'resolved').length

  const breadcrumbs = [
    { label: 'Dashboard', href: '/supplier' },
    { label: 'Support', href: '/supplier/support' }
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'waiting', label: 'Waiting' },
        { value: 'resolved', label: 'Resolved' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priority' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    }
  ]

  const columns = [
    {
      key: 'id',
      label: 'Ticket ID',
      render: (ticket: any) => (
        <div className="font-medium text-blue-600">{ticket.id}</div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (ticket: any) => (
        <div className="font-medium text-gray-900">{ticket.subject}</div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (ticket: any) => (
        <div className="text-gray-600 capitalize">{ticket.category}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (ticket: any) => (
        <StatusBadge status={ticket.status} />
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (ticket: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {ticket.priority}
        </span>
      )
    },
    {
      key: 'created',
      label: 'Created',
      render: (ticket: any) => (
        <div className="text-gray-600">{ticket.created}</div>
      )
    },
    {
      key: 'messages',
      label: 'Messages',
      render: (ticket: any) => (
        <div className="text-gray-900">{ticket.messages}</div>
      )
    }
  ]

  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: Eye,
      onClick: (ticket: any) => {
        console.log('Viewing ticket:', ticket.id)
        // TODO: Navigate to ticket details
      }
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (ticket: any) => {
        console.log('Editing ticket:', ticket.id)
        // TODO: Open edit modal
      },
      show: (ticket: any) => ticket.status !== 'resolved'
    }
  ]

  return (
    <ModernSubpageLayout
      title="Support Center"
      subtitle="Get help and manage support tickets"
      breadcrumbs={breadcrumbs}
      showAddButton
      addButtonText="New Ticket"
      onAddClick={handleNewTicket}
      showExportButton
      onExportClick={handleExport}
    >
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{openTickets}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressTickets}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedTickets}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">2.5h</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contact Info
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <FilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />

            <DataTable
              data={filteredTickets}
              columns={columns}
              actions={actions}
              loading={false}
            />

            {filteredTickets.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No support tickets found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
                <p className="text-gray-600 mb-2">+90 212 555 0123</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                <p className="text-gray-600 mb-2">support@nubiago.com</p>
                <p className="text-sm text-gray-500">24/7 Response</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Live Chat</h4>
                <p className="text-gray-600 mb-2">Available Now</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How do I update my product listings?</h4>
                <p className="text-gray-600 text-sm">You can update your product listings by going to the Products section in your dashboard and clicking the edit button next to any product.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">When do I receive payments?</h4>
                <p className="text-gray-600 text-sm">Payments are processed weekly on Fridays. You&apos;ll receive payment for all completed orders from the previous week.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How do I track my inventory?</h4>
                <p className="text-gray-600 text-sm">Use the Inventory section to monitor stock levels, set low stock alerts, and manage your product quantities.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What are the shipping requirements?</h4>
                <p className="text-gray-600 text-sm">All orders must be shipped within 2 business days. You can use our integrated shipping partners or your own shipping methods.</p>
              </div>
            </div>
          </div>
        )}

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Support Ticket</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Select a category</option>
                    <option value="account">Account Issues</option>
                    <option value="payments">Payment Issues</option>
                    <option value="products">Product Issues</option>
                    <option value="shipping">Shipping Issues</option>
                    <option value="technical">Technical Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide detailed information about your issue"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTicket(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Ticket
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
