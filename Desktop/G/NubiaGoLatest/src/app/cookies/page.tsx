import Link from 'next/link'
import { Shield, Settings, Eye, Lock } from 'lucide-react'

export default function CookiesPage() {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.',
      examples: ['Authentication cookies', 'Shopping cart cookies', 'Security cookies'],
      necessary: true
    },
    {
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: ['Google Analytics', 'Page view tracking', 'User behavior analysis'],
      necessary: false
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
      examples: ['Social media cookies', 'Advertising cookies', 'Retargeting cookies'],
      necessary: false
    },
    {
      name: 'Preference Cookies',
      description: 'These cookies allow the website to remember choices you make and provide enhanced, more personal features.',
      examples: ['Language preferences', 'Theme settings', 'Display preferences'],
      necessary: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn how we use cookies and similar technologies to improve your browsing experience on NubiaGo.
            </p>
          </div>
        </div>
      </div>

      {/* What Are Cookies */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Are Cookies?
          </h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-gray-700 mb-6">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Remembering your preferences and settings</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Analyzing how our website is used to improve performance</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Providing personalized content and advertisements</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Ensuring security and preventing fraud</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Types of Cookies */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Types of Cookies We Use
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {cookieTypes.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {type.name}
                    </h3>
                    {type.necessary && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Necessary
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {type.description}
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {type.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cookie Management */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Managing Your Cookie Preferences
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Browser Settings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Block all cookies</li>
                <li>• Allow cookies from specific sites</li>
                <li>• Delete existing cookies</li>
                <li>• Set preferences for different types of cookies</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cookie Consent</h3>
              </div>
              <p className="text-gray-600 mb-4">
                When you first visit our website, you'll see a cookie consent banner that allows you to:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Accept all cookies</li>
                <li>• Reject non-essential cookies</li>
                <li>• Customize your preferences</li>
                <li>• Learn more about our cookie policy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Third-Party Cookies */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Third-Party Cookies
          </h2>
          <div className="bg-white p-8 rounded-lg">
            <p className="text-gray-700 mb-6">
              We may use third-party services that place cookies on your device. These services help us:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Analytics Services</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Google Analytics for website usage analysis</li>
                  <li>• Hotjar for user behavior tracking</li>
                  <li>• Plausible Analytics for privacy-focused analytics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Marketing Services</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Facebook Pixel for advertising</li>
                  <li>• Google Ads for remarketing</li>
                  <li>• Social media plugins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Updates and Contact */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Questions About Cookies?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              If you have any questions about our use of cookies or would like to manage your preferences, 
              please contact our privacy team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors">
                Contact Us
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
