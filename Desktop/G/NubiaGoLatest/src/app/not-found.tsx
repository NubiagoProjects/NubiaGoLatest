import { Home, ArrowLeft, Search, MapPin, Compass, Users, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Premium 404 Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
            <Search className="w-4 h-4 mr-2" />
            Page Not Found
          </div>
          
          <div className="w-32 h-32 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Search className="h-16 w-16 text-white" />
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
            404
          </h1>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Page Not Found</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Premium Action Buttons */}
        <div className="space-y-6 mb-12">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-xl transform hover:-translate-y-1 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg"
          >
            <Home className="w-6 h-6" />
            <span>Go Home</span>
          </Link>
          
          <Link
            href="javascript:history.back()"
            className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg shadow-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Go Back</span>
          </Link>
        </div>

        {/* Premium Popular Pages */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Pages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/products"
              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Products</h4>
                  <p className="text-sm text-gray-600">Browse our catalog</p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/about"
              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">About Us</h4>
                  <p className="text-sm text-gray-600">Learn about our company</p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/contact"
              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Contact</h4>
                  <p className="text-sm text-gray-600">Get in touch</p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/faq"
              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">FAQ</h4>
                  <p className="text-sm text-gray-600">Find answers</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12">
          <p className="text-gray-600 mb-4">Try searching for what you're looking for:</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search our website..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
