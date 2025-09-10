import Link from 'next/link'
import { Search, ChevronRight, MessageCircle, Phone, Mail, FileText, ShoppingBag, CreditCard, Truck, Shield } from 'lucide-react'

export default function HelpPage() {
  const categories = [
    {
      title: 'Getting Started',
      icon: ShoppingBag,
      description: 'Learn how to create an account and make your first purchase',
      articles: [
        'How to create an account',
        'Making your first purchase',
        'Understanding product listings',
        'Account verification process'
      ]
    },
    {
      title: 'Orders & Shipping',
      icon: Truck,
      description: 'Track orders, understand shipping options, and delivery times',
      articles: [
        'How to track your order',
        'Shipping options and costs',
        'Delivery timeframes',
        'International shipping'
      ]
    },
    {
      title: 'Payments & Billing',
      icon: CreditCard,
      description: 'Payment methods, refunds, and billing questions',
      articles: [
        'Accepted payment methods',
        'How to request a refund',
        'Understanding charges',
        'Payment security'
      ]
    },
    {
      title: 'Account & Security',
      icon: Shield,
      description: 'Manage your account settings and security preferences',
      articles: [
        'Updating your profile',
        'Password and security',
        'Privacy settings',
        'Two-factor authentication'
      ]
    }
  ]

  const popularArticles = [
    'How to track your order',
    'Return and refund policy',
    'Payment methods accepted',
    'Contact seller directly',
    'Report a problem'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Find answers to common questions and get support for your NubiaGo experience.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Popular Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href={`/help/${article.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-900 font-medium">{article}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <div key={index} className="bg-white p-8 rounded-lg border hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <Link
                        key={articleIndex}
                        href={`/help/${article.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700">{article}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-sm opacity-90">support@nubiago.com</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-sm opacity-90">+234 123 456 7890</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-sm opacity-90">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
