import Link from 'next/link'
import { Shield, Download, Eye, Lock, User, Trash2, Edit, ArrowRight } from 'lucide-react'

export default function GDPRPage() {
  const rights = [
    {
      title: 'Right to Access',
      description: 'You can request a copy of all personal data we hold about you.',
      icon: Eye
    },
    {
      title: 'Right to Rectification',
      description: 'You can request correction of inaccurate or incomplete personal data.',
      icon: Edit
    },
    {
      title: 'Right to Erasure',
      description: 'You can request deletion of your personal data in certain circumstances.',
      icon: Trash2
    },
    {
      title: 'Right to Portability',
      description: 'You can request your data in a structured, machine-readable format.',
      icon: Download
    },
    {
      title: 'Right to Object',
      description: 'You can object to processing of your personal data.',
      icon: Shield
    },
    {
      title: 'Right to Restriction',
      description: 'You can request limitation of processing in certain circumstances.',
      icon: Lock
    }
  ]

  const dataCategories = [
    {
      category: 'Account Information',
      examples: ['Name, email, phone number', 'Address and shipping details', 'Account preferences and settings'],
      purpose: 'Account creation and management, order processing, customer support'
    },
    {
      category: 'Order Data',
      examples: ['Purchase history', 'Payment information', 'Shipping details'],
      purpose: 'Order fulfillment, payment processing, delivery tracking'
    },
    {
      category: 'Website Usage',
      examples: ['Pages visited', 'Search queries', 'Click behavior'],
      purpose: 'Website improvement, personalized experience, analytics'
    },
    {
      category: 'Communication',
      examples: ['Support tickets', 'Email correspondence', 'Chat messages'],
      purpose: 'Customer service, issue resolution, communication'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              GDPR Compliance
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We are committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR).
            </p>
          </div>
        </div>
      </div>

      {/* What is GDPR */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What is GDPR?
          </h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-gray-700 mb-6">
              The General Data Protection Regulation (GDPR) is a comprehensive data protection law that gives you control over your personal data. It applies to all organizations that process personal data of EU residents, regardless of where the organization is located.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Principles:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Lawfulness, fairness, and transparency</li>
                  <li>• Purpose limitation</li>
                  <li>• Data minimization</li>
                  <li>• Accuracy</li>
                  <li>• Storage limitation</li>
                  <li>• Integrity and confidentiality</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Your Rights:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Right to access your data</li>
                  <li>• Right to rectification</li>
                  <li>• Right to erasure</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to processing</li>
                  <li>• Right to restrict processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Rights */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Your GDPR Rights
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rights.map((right, index) => {
              const IconComponent = right.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{right.title}</h3>
                  </div>
                  <p className="text-gray-600">{right.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Data We Collect */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Data We Collect and Process
          </h2>
          <div className="space-y-8">
            {dataCategories.map((category, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {category.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Purpose:</h4>
                    <p className="text-sm text-gray-600">{category.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How to Exercise Your Rights */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How to Exercise Your Rights
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Account Dashboard</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Access your account settings to view, update, or delete your personal information.
              </p>
              <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Send us a request for data access, correction, or deletion.
              </p>
              <Link href="/contact" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Contact Privacy Team
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Data Protection Measures */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Data Protection Measures
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Encryption</h3>
              <p className="text-gray-600 text-sm">
                All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Access Controls</h3>
              <p className="text-gray-600 text-sm">
                Strict access controls ensure only authorized personnel can access personal data.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600 text-sm">
                Clear information about how we collect, use, and protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Questions About GDPR?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              If you have any questions about our GDPR compliance or would like to exercise your rights, 
              please contact our Data Protection Officer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors">
                Contact DPO
              </Link>
              <Link href="/privacy" className="inline-flex items-center px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-2xl font-semibold hover:bg-primary-50 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
