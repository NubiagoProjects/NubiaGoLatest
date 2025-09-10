import { ArrowLeft, FileText, Shield, CheckCircle, AlertTriangle, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
              <FileText className="w-4 h-4 mr-2" />
              Enterprise Terms
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
              Terms of Service
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade terms and conditions for our marketplace platform
            </p>
          </div>
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

        {/* Terms Content */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12">
          <div className="space-y-12">
            {/* Section 1 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    By accessing and using this enterprise marketplace platform, you accept and agree to be bound by the terms and provision of this agreement. 
                    These terms govern your use of our services and constitute a legally binding agreement between you and NubiaGo.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, 
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    In no event shall NubiaGo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if NubiaGo or a NubiaGo authorized representative has been notified orally or in writing of the possibility of such damage.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">7</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    The Service and its original content, features, and functionality are and will remain the exclusive property of NubiaGo and its licensors. The Service is protected by copyright, trademark, and other laws.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 8 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">8</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 9 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">9</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    These Terms shall be interpreted and governed by the laws of Nigeria, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 10 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-pink-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">10</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions About These Terms?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors">
                <span>Contact Us</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link href="/privacy" className="inline-flex items-center px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-2xl font-semibold hover:bg-primary-50 transition-colors">
                <span>Privacy Policy</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
