'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  HelpCircle, MessageCircle, Phone, Mail, FileText,
  ArrowLeft, ChevronDown, ChevronUp, Send
} from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  lastUpdated: string
}

export default function CustomerSupportPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  })

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I track my order?',
      answer: 'You can track your order by going to your dashboard and clicking on the "Track Order" button next to your order. You can also visit the order tracking page directly.',
      category: 'orders'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept Mobile Money payments and credit/debit cards. All payments are processed securely through our payment partners.',
      category: 'payments'
    },
    {
      id: '3',
      question: 'How long does shipping take?',
      answer: 'Shipping typically takes 3-7 business days depending on your location. You can see the estimated delivery date when placing your order.',
      category: 'shipping'
    },
    {
      id: '4',
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 1 hour of placing it. After that, please contact our support team for assistance.',
      category: 'orders'
    },
    {
      id: '5',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be unused and in original packaging. Contact support to initiate a return.',
      category: 'returns'
    },
    {
      id: '6',
      question: 'How do I contact customer support?',
      answer: 'You can contact us through email, phone, or live chat. Our support team is available 24/7 to help you.',
      category: 'support'
    }
  ]

  const supportTickets: SupportTicket[] = [
    {
      id: 'TICKET-001',
      subject: 'Order not delivered',
      status: 'resolved',
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'TICKET-002',
      subject: 'Payment issue',
      status: 'in-progress',
      createdAt: '2024-01-20',
      lastUpdated: '2024-01-22'
    }
  ]

  const filteredFAQs = faqItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  )

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate ticket submission
    alert('Support ticket submitted successfully! We\'ll get back to you soon.')
    setShowContactForm(false)
    setContactForm({ subject: '', message: '', priority: 'medium' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-yellow-600 bg-yellow-100'
      case 'open': return 'text-blue-600 bg-blue-100'
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
              <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
              <p className="text-gray-600">Get help with your orders and account</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="mailto:support@example.com"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Mail className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-xs text-gray-500">support@example.com</p>
                  </div>
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Phone className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Support</p>
                    <p className="text-xs text-gray-500">+1 (234) 567-890</p>
                  </div>
                </a>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-left"
                >
                  <MessageCircle className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Live Chat</p>
                    <p className="text-xs text-gray-500">Available 24/7</p>
                  </div>
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', 'orders', 'payments', 'shipping', 'returns', 'support'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        activeCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900">{item.question}</span>
                      {expandedFAQ === item.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Submit a Support Ticket</h2>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit Ticket</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Tickets */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Support Tickets</h3>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Created: {ticket.createdAt}</p>
                    <p className="text-xs text-gray-500">Updated: {ticket.lastUpdated}</p>
                  </div>
                ))}
                {supportTickets.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent tickets</p>
                )}
              </div>
            </div>

            {/* Help Resources */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Help Resources</h3>
              <div className="space-y-3">
                <Link
                  href="/terms"
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Terms of Service</span>
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Privacy Policy</span>
                </Link>
                <Link
                  href="/faq"
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <HelpCircle className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">FAQ</span>
                </Link>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Support Hours</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Emergency support available 24/7 via email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
