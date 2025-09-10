import Link from 'next/link'
import { User, Shield, Eye, Lock, FileText, Calendar, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
            <Shield className="w-4 h-4 mr-2" />
            Enterprise Privacy
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            How we collect, use, and protect your personal information with enterprise-grade security
          </p>
        </div>

        {/* Last Updated */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 mb-12">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 font-semibold">
              <strong>Last updated:</strong> December 15, 2024
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            At NubiaGo, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            enterprise-grade marketplace platform.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            If you have any questions about this Privacy Policy, please contact our privacy team.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Information We Collect</h2>
          
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Personal Information</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Name, email address, phone number, shipping address, and payment information for secure transactions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Usage Information</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    How you interact with our platform, including pages visited, search queries, and purchase history for improved experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Device Information</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    IP address, browser type, operating system, and device identifiers for security and analytics purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How We Use Information */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How We Use Your Information</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Service Provision</h3>
              </div>
              <p className="text-gray-600">
                Process transactions, fulfill orders, and provide customer support services.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Platform Improvement</h3>
              </div>
              <p className="text-gray-600">
                Analyze usage patterns to enhance user experience and platform functionality.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Security & Fraud Prevention</h3>
              </div>
              <p className="text-gray-600">
                Protect against fraud, abuse, and ensure platform security.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Communication</h3>
              </div>
              <p className="text-gray-600">
                Send order updates, promotional offers, and important service notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Information Sharing & Disclosure</h2>
          
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">We Never Sell Your Data</h3>
                  <p className="text-gray-600">
                    We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Service Providers</h4>
                <p className="text-gray-600 text-sm">
                  Trusted partners who help us operate our platform (payment processors, shipping companies).
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Legal Requirements</h4>
                <p className="text-gray-600 text-sm">
                  When required by law or to protect our rights and safety.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Business Transfers</h4>
                <p className="text-gray-600 text-sm">
                  In case of merger, acquisition, or sale of assets (with user consent).
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Consent</h4>
                <p className="text-gray-600 text-sm">
                  When you explicitly agree to share information with specific third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Data Security</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Encryption</h3>
              <p className="text-gray-600">
                All data is encrypted using industry-standard SSL/TLS protocols during transmission and storage.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Access Controls</h3>
              <p className="text-gray-600">
                Strict access controls and authentication mechanisms protect your data from unauthorized access.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Regular Audits</h3>
              <p className="text-gray-600">
                Regular security audits and penetration testing ensure our systems remain secure.
              </p>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Privacy Rights</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access Your Data</h3>
                  <p className="text-gray-600 text-sm">
                    Request a copy of your personal information we hold.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Update Information</h3>
                  <p className="text-gray-600 text-sm">
                    Correct or update your personal information in your account settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Delete Account</h3>
                  <p className="text-gray-600 text-sm">
                    Request deletion of your account and associated data.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Opt-Out</h3>
                  <p className="text-gray-600 text-sm">
                    Unsubscribe from marketing communications and promotional emails.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
                  <p className="text-gray-600 text-sm">
                    Request your data in a machine-readable format.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lodge Complaints</h3>
                  <p className="text-gray-600 text-sm">
                    Contact us or relevant authorities with privacy concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Team</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact our dedicated privacy team.
              </p>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> privacy@nubiago.com
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong> +234 123 456 7890
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong> 123 Privacy Street, Lagos, Nigeria
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Link href="/contact" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-900 font-medium">Contact Support</span>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link href="/terms" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-900 font-medium">Terms of Service</span>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link href="/cookies" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-900 font-medium">Cookie Policy</span>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
